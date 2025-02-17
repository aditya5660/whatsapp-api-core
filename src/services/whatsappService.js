const fs = require("fs");
const path = require("path");

const pino = require("pino");
const { toDataURL } = require("qrcode");
const { sendResponse } = require("../utils/response");
const httpStatusCode = require("../constants/httpStatusCode");
const dirname = require("../utils/dirname.js");
const util = require("util");

const readFileAsync = util.promisify(fs.readFile);
const {
  makeWASocket,
  DisconnectReason,
  makeInMemoryStore,
  useMultiFileAuthState,
  delay,
  Browsers,
} = require("@whiskeysockets/baileys");

const WebSocket = require("ws");

const sessions = new Map();
const retries = new Map();

const sessionsDir = (sessionId = "") =>
  path.join(dirname, "sessions", sessionId || "");

const isSessionExists = (sessionId) => sessions.has(sessionId);

const getSessionStatus = async (sessionId) => {
  try {
    // Cek sesi di memory terlebih dahulu
    const session = sessions.get(sessionId);
    if (session) {
      try {
        const connectionState = await session.ws.readyState;
        if (connectionState === WebSocket.OPEN) {
          // Baca data credentials
          const data = await readFileAsync(
            `sessions/md_${sessionId}/creds.json`
          );
          const userdata = JSON.parse(data);

          return {
            status: "connected",
            user: userdata,
            connectionState: "open",
          };
        }
      } catch (error) {
        console.log(`Error checking session ${sessionId} status:`, error);
      }
    }

    // Jika tidak ada di memory, cek file credentials
    try {
      const data = await readFileAsync(`sessions/md_${sessionId}/creds.json`);
      const userdata = JSON.parse(data);

      return {
        status: "exists",
        user: userdata,
        connectionState: "closed",
      };
    } catch {
      return {
        status: "not_found",
        connectionState: null,
      };
    }
  } catch (error) {
    console.error(`Error getting session status for ${sessionId}:`, error);
    return {
      status: "error",
      error: error.message,
    };
  }
};

const cleanupSession = async (sessionId) => {
  try {
    const session = sessions.get(sessionId);
    if (session) {
      // Membersihkan event listeners
      session.ev.removeAllListeners("connection.update");
      session.ev.removeAllListeners("creds.update");
      session.ev.removeAllListeners("chats.set");
      session.ev.removeAllListeners("messages.update");

      // Menutup koneksi
      await session.ws.close();

      // Membersihkan store
      if (session.store) {
        session.store.writeToFile(sessionsDir(sessionId + "_store.json"));
      }

      // Menghapus sesi dari map
      sessions.delete(sessionId);

      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error cleaning up session ${sessionId}:`, error);
    return false;
  }
};

// Tambahkan fungsi helper untuk cek folder
const checkAndCleanSessionFolder = (sessionId) => {
  try {
    const sessionDir = path.join(sessionsDir(), `md_${sessionId}`);
    const storeFile = path.join(sessionsDir(), `${sessionId}_store.json`);

    // Cek apakah folder ada
    if (fs.existsSync(sessionDir)) {
      const files = fs.readdirSync(sessionDir);

      // Jika folder kosong atau tidak ada creds.json
      if (files.length === 0 || !files.includes("creds.json")) {
        console.log(
          `[${sessionId}] Invalid session folder found, cleaning up...`
        );

        // Hapus folder sesi
        fs.rmSync(sessionDir, { recursive: true, force: true });

        // Hapus file store jika ada
        if (fs.existsSync(storeFile)) {
          fs.unlinkSync(storeFile);
        }

        return false;
      }
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[${sessionId}] Error checking session folder:`, error);
    return false;
  }
};

const createSession = async (sessionId, isLegacy = false, res = null) => {
  try {
    // Cek folder sesi terlebih dahulu
    const validSession = checkAndCleanSessionFolder(sessionId);

    if (!validSession) {
      if (res && !res.headersSent) {
        return sendResponse(
          res,
          httpStatusCode.NOT_FOUND,
          "Session not found or invalid",
          {
            status: "not_found",
            message: "Please create a new session",
          }
        );
      }
      return null;
    }

    // Cek apakah sesi sudah ada dan terkoneksi
    const existingSession = sessions.get(sessionId);
    if (existingSession) {
      try {
        const connectionState = await existingSession.ws.readyState;
        if (connectionState === WebSocket.OPEN) {
          console.log(`[${sessionId}] Session already exists and connected`);
          const sessionStatus = await getSessionStatus(sessionId);

          if (res && !res.headersSent) {
            return sendResponse(
              res,
              httpStatusCode.OK,
              "Session already exists and connected",
              {
                status: "connected",
                ...sessionStatus,
              }
            );
          }
          return existingSession;
        }
      } catch (error) {
        console.log(
          `[${sessionId}] Existing session is invalid, recreating...`
        );
      }
    }

    await cleanupSession(sessionId);

    const sessionFileName =
      (isLegacy ? "legacy_" : "md_") + sessionId + (isLegacy ? ".json" : "");
    const sessionExists = fs.existsSync(
      path.join(sessionsDir(sessionFileName), "creds.json")
    );

    const logger = pino({ level: "silent" });
    const store = makeInMemoryStore({ logger });

    const { state, saveCreds } = await useMultiFileAuthState(
      sessionsDir(sessionFileName)
    );

    const client = makeWASocket({
      printQRInTerminal: true,
      browser: Browsers.ubuntu("Chrome"),
      auth: state,
      logger,
    });

    store.bind(client.ev);
    sessions.set(sessionId, { ...client, store, isLegacy });

    // Tambahkan timeout untuk mencegah infinity loop
    let connectionTimeout;
    let hasResponded = false;

    client.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      // Clear timeout setiap kali ada update
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }

      if (connection === "connecting") {
        console.log(`[${sessionId}] Connecting...`);
      }

      if (connection === "open") {
        retries.delete(sessionId);
        console.log(`[${sessionId}] Connected successfully!`);
        hasResponded = true;

        if (res && !res.headersSent) {
          return sendResponse(
            res,
            httpStatusCode.OK,
            "Session connected successfully",
            {
              status: "connected",
            }
          );
        }
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        console.log(
          `[${sessionId}] Connection closed. Status code:`,
          statusCode
        );

        // Handle error 515 (stream error)
        if (statusCode === 515) {
          console.log(
            `[${sessionId}] Stream error detected, attempting recovery...`
          );
          await cleanupSession(sessionId);
          await new Promise((resolve) => setTimeout(resolve, 5000));

          const retriesCount = retries.get(sessionId) || 0;
          if (retriesCount < 3) {
            console.log(
              `[${sessionId}] Recreating session... (Attempt ${
                retriesCount + 1
              }/3)`
            );
            retries.set(sessionId, retriesCount + 1);
            await createSession(sessionId, isLegacy, res);
            return;
          } else {
            console.log(
              `[${sessionId}] Max retries reached after stream error`
            );
            hasResponded = true;
            if (res && !res.headersSent) {
              return sendResponse(
                res,
                httpStatusCode.INTERNAL_SERVER_ERROR,
                "Failed to establish stable connection",
                null
              );
            }
          }
        } else {
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect && !hasResponded) {
            const retriesCount = retries.get(sessionId) || 0;
            if (retriesCount < 3) {
              console.log(
                `[${sessionId}] Connection lost, attempting to reconnect... (Attempt ${
                  retriesCount + 1
                }/3)`
              );
              retries.set(sessionId, retriesCount + 1);
              await cleanupSession(sessionId);
              await new Promise((resolve) => setTimeout(resolve, 3000));
              await createSession(sessionId, isLegacy, res);
            } else {
              console.log(`[${sessionId}] Max reconnection attempts reached`);
              hasResponded = true;
              await cleanupSession(sessionId);
              if (res && !res.headersSent) {
                return sendResponse(
                  res,
                  httpStatusCode.INTERNAL_SERVER_ERROR,
                  "Failed to reconnect after maximum attempts",
                  null
                );
              }
            }
          }
        }
      }

      // Tampilkan QR jika ini sesi baru
      if (qr && !sessionExists && !hasResponded) {
        hasResponded = true;
        if (res && !res.headersSent) {
          try {
            const qrImage = await toDataURL(qr);
            return sendResponse(
              res,
              httpStatusCode.OK,
              "QR Code generated successfully",
              {
                qr: qrImage,
              }
            );
          } catch (error) {
            console.error("QR Generation Error:", error);
            return sendResponse(
              res,
              httpStatusCode.INTERNAL_SERVER_ERROR,
              "Failed to generate QR code",
              null,
              error
            );
          }
        }
      }

      // Set timeout baru (60 detik)
      connectionTimeout = setTimeout(async () => {
        if (!hasResponded && res && !res.headersSent) {
          console.log(`Connection timeout for session ${sessionId}`);
          hasResponded = true;
          await cleanupSession(sessionId);
          return sendResponse(
            res,
            httpStatusCode.REQUEST_TIMEOUT,
            "Connection timeout",
            null
          );
        }
      }, 60000);
    });

    client.ev.on("creds.update", saveCreds);

    return client;
  } catch (error) {
    console.error(`[${sessionId}] Failed to create session:`, error);
    await cleanupSession(sessionId);

    if (res && !res.headersSent) {
      return sendResponse(
        res,
        httpStatusCode.INTERNAL_SERVER_ERROR,
        "Failed to create session",
        null,
        error
      );
    }
    throw error;
  }
};

const getSession = (sessionId) => sessions.get(sessionId) || null;

const deleteSession = async (sessionId, isLegacy = false, res = null) => {
  try {
    console.log(`[${sessionId}] Attempting to logout session...`);

    // Cek apakah sesi ada di memory atau file system
    const session = sessions.get(sessionId);
    const sessionFileName =
      (isLegacy ? "legacy_" : "md_") + sessionId + (isLegacy ? ".json" : "");
    const sessionPath = sessionsDir(sessionFileName);
    const sessionExists = fs.existsSync(sessionPath);

    if (!session && !sessionExists) {
      console.log(`[${sessionId}] Session not found in memory or filesystem`);
      if (res) {
        return sendResponse(
          res,
          httpStatusCode.NOT_FOUND,
          "Session not found",
          null
        );
      }
      return false;
    }

    // Jika sesi ada di memory, lakukan logout
    if (session) {
      try {
        console.log(`[${sessionId}] Logging out session...`);
        await session.logout();
        console.log(`[${sessionId}] Successfully logged out from WhatsApp`);
      } catch (error) {
        console.log(
          `[${sessionId}] Error during WhatsApp logout:`,
          error.message
        );
      }
    }

    // Hapus semua file dan folder terkait sesi
    try {
      console.log(`[${sessionId}] Removing session files and directories...`);

      // Hapus folder sesi utama jika ada
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { force: true, recursive: true });
      }

      // Hapus file store
      const storeFile = sessionsDir(sessionId + "_store.json");
      if (fs.existsSync(storeFile)) {
        fs.rmSync(storeFile, { force: true });
      }

      // Hapus folder pre-keys jika ada
      const preKeysPath = path.join(sessionPath, "pre-keys");
      if (fs.existsSync(preKeysPath)) {
        fs.rmSync(preKeysPath, { force: true, recursive: true });
      }

      console.log(`[${sessionId}] Successfully removed all session files`);
    } catch (error) {
      console.log(
        `[${sessionId}] Error removing session files:`,
        error.message
      );
    }

    // Cleanup dari memory
    try {
      console.log(`[${sessionId}] Cleaning up session from memory...`);
      if (session) {
        // Membersihkan event listeners
        session.ev.removeAllListeners("connection.update");
        session.ev.removeAllListeners("creds.update");
        session.ev.removeAllListeners("chats.set");
        session.ev.removeAllListeners("messages.update");

        // Menutup koneksi
        if (session.ws) {
          await session.ws.close();
        }

        // Membersihkan store
        if (session.store) {
          session.store.writeToFile(sessionsDir(sessionId + "_store.json"));
        }
      }
      console.log(`[${sessionId}] Successfully cleaned up from memory`);
    } catch (error) {
      console.log(
        `[${sessionId}] Error cleaning up from memory:`,
        error.message
      );
    }

    // Hapus dari maps
    sessions.delete(sessionId);
    retries.delete(sessionId);

    // Double check untuk memastikan folder benar-benar terhapus
    setTimeout(() => {
      try {
        if (fs.existsSync(sessionPath)) {
          fs.rmSync(sessionPath, { force: true, recursive: true });
        }
      } catch (error) {
        console.log(`[${sessionId}] Final cleanup error:`, error.message);
      }
    }, 1000);

    if (res) {
      return sendResponse(
        res,
        httpStatusCode.OK,
        "Session logged out successfully",
        {
          sessionId,
          status: "logged_out",
        }
      );
    }
    return true;
  } catch (error) {
    console.error(`[${sessionId}] Failed to logout session:`, error);
    if (res) {
      return sendResponse(
        res,
        httpStatusCode.INTERNAL_SERVER_ERROR,
        "Failed to logout session",
        null,
        error
      );
    }
    throw error;
  }
};

const getChatList = (sessionId, isGroup = false) => {
  try {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const chatType = isGroup ? "@g.us" : "@s.whatsapp.net";
    const chats = session.store.chats.filter((chat) => {
      return chat.id.endsWith(chatType);
    });

    // Format data untuk grup
    if (isGroup) {
      return chats.map((chat) => ({
        id: chat.id,
        name: chat.name || "Unknown Group",
        participant_count: chat.participantCount || 0,
        creation_time: chat.creationTime || new Date().toISOString(),
      }));
    }

    return chats;
  } catch (error) {
    console.error(`[${sessionId}] Error getting chat list:`, error);
    throw error;
  }
};

const isExists = async (client, jid, isGroup = false) => {
  try {
    let chatInfo;

    if (isGroup) {
      chatInfo = await client.groupMetadata(jid);
      return Boolean(chatInfo.id);
    }

    chatInfo = await client.onWhatsApp(jid);

    return chatInfo.exists;
  } catch {
    return false;
  }
};

const groupFetchAllParticipating = (client) => {
  try {
    return client.groupFetchAllParticipating();
  } catch (err) {
    return false;
  }
};

const sendMessage = async (client, chatId, message, delayTime = 5) => {
  try {
    return client.sendMessage(chatId, message);
  } catch (err) {
    return Promise.reject(null);
  }
};

const formatPhone = (phoneNumber) => {
  phoneNumber = phoneNumber.replace(/\D/g, "");

  if (phoneNumber.startsWith("08")) {
    phoneNumber = phoneNumber.replace("08", "628");
  } else if (phoneNumber.startsWith("+628")) {
    phoneNumber = phoneNumber.replace("+628", "628");
  }

  return phoneNumber + "@s.whatsapp.net";
};

const formatGroup = (groupId) => {
  if (groupId.toString().endsWith("@g.us")) {
    return groupId;
  }

  const cleanedGroupId = groupId.replace(/[^\d-]/g, "");
  return cleanedGroupId + "@g.us";
};

const cleanup = () => {
  console.log("Running cleanup before exit.");
  sessions.forEach((client, sessionId) => {
    if (!client.isLegacy) {
      client.store.writeToFile(sessionsDir(sessionId + "_store.json"));
    }
  });
};

const init = () => {
  // check if sessionsFolder not exists then create it
  if (!fs.existsSync(sessionsDir())) {
    fs.mkdirSync(sessionsDir());
  }

  fs.readdirSync(sessionsDir()).forEach((fileName) => {
    if (
      !(fileName.startsWith("md_") || fileName.startsWith("legacy_")) ||
      fileName.endsWith("_store")
    ) {
      return;
    }

    const parts = fileName.replace(".json", "").split("_");
    const isLegacy = parts[0] !== "md";
    const sessionId = isLegacy
      ? parts.slice(2).join("_")
      : parts.slice(1).join("_");

    createSession(sessionId, isLegacy);
  });
};

// Menambahkan fungsi untuk membersihkan semua sesi
const cleanupAllSessions = async () => {
  const sessionIds = Array.from(sessions.keys());
  for (const sessionId of sessionIds) {
    await cleanupSession(sessionId);
  }
};

module.exports = {
  isSessionExists,
  createSession,
  getSession,
  deleteSession,
  getChatList,
  isExists,
  groupFetchAllParticipating,
  sendMessage,
  formatPhone,
  formatGroup,
  cleanup,
  init,
  getSessionStatus,
  cleanupSession,
  cleanupAllSessions,
};
