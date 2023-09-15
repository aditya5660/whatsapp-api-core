const fs = require('fs');
const path = require('path');
const { fileURLToPath } = require('url');
const pino = require('pino');
const { toDataURL } = require('qrcode');
const dirname = require('../utils/dirname.js');
const ResponseUtil = require('../utils/response.js');
const axios = require('axios');
const util = require('util');
const messageService = require('./messageService');

const readFileAsync = util.promisify(fs.readFile);
const {
    makeWASocket,
    DisconnectReason,
    makeInMemoryStore,
    useMultiFileAuthState,
    delay
} = require('@whiskeysockets/baileys');
const deviceService = require('./deviceService.js');

const sessions = new Map();
const retries = new Map();

const sessionsDir = (sessionId = '') => path.join(dirname, 'sessions', sessionId || '');


const isSessionExists = (sessionId) => sessions.has(sessionId);

const shouldReconnect = (sessionId) => {
    let maxRetries = parseInt(process.env.MAX_RETRIES || 0);
    let retriesCount = retries.get(sessionId) || 0;
    maxRetries = maxRetries < 1 ? 1 : maxRetries;

    if (retriesCount < maxRetries) {
        retriesCount++;
        console.log("Reconnecting...", { attempts: retriesCount, sessionId });
        retries.set(sessionId, retriesCount);
        return true;
    }

    return false;
};



const getSessionStatus = async (sessionId) => {
    try {
        const data = await readFileAsync(`sessions/md_${sessionId}/creds.json`);
    
        let userdata = JSON.parse(data);
        return {
            status: "connected",
            user: userdata
        }
    } catch {
        return {
            status: "disconnected",
        };
    }
};


const createSession = async (sessionId, isLegacy = false, res = null) => {
    const sessionFileName = (isLegacy ? 'legacy_' : 'md_') + sessionId + (isLegacy ? '.json' : '');
    const logger = pino({ level: "warn" });
    const inMemoryStore = makeInMemoryStore({ logger });

    let auth;
    let saveCreds;

    if (isLegacy) {
        // Handle legacy logic
    } else {
        ({ state: auth, saveCreds } = await useMultiFileAuthState(sessionsDir(sessionFileName)));
    }

    const clientOptions = {
        auth,
        printQRInTerminal: true,
        logger,
        browser: [process.env.APP_NAME || 'Whatsapp Api', "Chrome", '103.0.5060.114'],
        patchMessageBeforeSending: (message) => {
            const isButtonsMessage = !!(message.buttonsMessage || message.listMessage);

            if (isButtonsMessage) {
                message = {
                    viewOnceMessage: { message: { messageContextInfo: { deviceListMetadataVersion: 0x2, deviceListMetadata: {} }, ...message } }
                };
            }

            return message;
        }
    };

    const client = makeWASocket(clientOptions);

    if (!isLegacy) {
        inMemoryStore.readFromFile(sessionsDir(sessionId + '_store.json'));
        inMemoryStore.bind(client.ev);
    }

    sessions.set(sessionId, { ...client, store: inMemoryStore, isLegacy });

    client.ev.on('creds.update', saveCreds);

    client.ev.on("chats.set", ({ chats }) => {
        if (isLegacy) {
            inMemoryStore.chats.insertIfAbsent(...chats);
        }
    });
    client.ev.on('messages.update', async (message) => {
        console.log('message updated', message);
        // loop the message
        await Promise.all(
            message.map(async (messageDetail) => {
                if (messageDetail.key.id,messageDetail.update.status) {
                    messageService.updateMessageByRemoteMessageId(messageDetail.key.id,messageDetail.update.status);
                }
            })
        );
        // remote_message_id, remote_jid
        // 1 => sent
        // 3 => delivered
        // 4 => read
    })
    client.ev.on('messages.upsert', async (message) => {

        try {
            const firstMessage = message.messages[0];
            if (!firstMessage.key.fromMe && message.type === "notify") {
                const webHookData = [];

                let conversation = firstMessage.message?.conversation || null;

                if (firstMessage?.message?.buttonsResponseMessage != null) {
                    conversation = firstMessage.message.buttonsResponseMessage.selectedDisplayText;
                }

                if (firstMessage.message?.listResponseMessage != null) {
                    conversation = firstMessage.message.listResponseMessage.title;
                }

                const remoteJidParts = firstMessage.key.remoteJid.split('@');
                const remoteId = remoteJidParts[1] || null;
                const isSWhatsApp = !(remoteId == 's.whatsapp.net');

                if (conversation !== '' && !isSWhatsApp) {
                    webHookData.remote_id = firstMessage.key.remoteJid;
                    webHookData.sessionId = sessionId;
                    webHookData.message_id = firstMessage.key.id;
                    webHookData.message = conversation;
                    
                    sentWebHook(sessionId, webHookData);
                    // TODO: implement auto reply
                }
            }

        } catch (err) {
            console.log(err);
        }
    });

    client.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        const statusCode = lastDisconnect?.["error"]?.["output"]?.['statusCode'];

        // console.log(update);
        if (connection === "open") {
            retries.delete(sessionId);
        }

        if (connection === "close") {
            if (statusCode === DisconnectReason.loggedOut || !shouldReconnect(sessionId)) {
                deleteSession(sessionId, isLegacy);
                return ResponseUtil.badRequest({
                    res,
                    message: "Unable to create session.",
                });
            }

            setTimeout(() => {
                createSession(sessionId, isLegacy, res);
            }, statusCode === DisconnectReason.restartRequired ? 0 : parseInt(process.env.RECONNECT_INTERVAL || 5000));
        }

        if (update.qr) {
            if (res && !res.headersSent) {
                try {
                    const qr = await toDataURL(update.qr);
                    return ResponseUtil.ok({
                        res,
                        message: "QR code generated",
                        data: {
                            qr
                        }
                    });
                } catch (error) {
                    return ResponseUtil.internalError({
                        res,
                        message: "Unable to create QR code.",
                        error
                    });
                }
            }

            try {
                await client.logout();
            } catch { } finally {
                deleteSession(sessionId, isLegacy);
            }
        }
    });
};

const getSession = (sessionId) => sessions.get(sessionId) || null;


const setDeviceStatus = (sessionId, status) => {
    deviceService.setStatus(sessionId, status ? 'connected' : 'disconnected');
    console.log('set device status', sessionId, status);
};

const sentWebHook = (sessionId, data) => {
    // todo implement send webhook
};

const deleteSession = (sessionId, isLegacy = false) => {
    const sessionFileName = (isLegacy ? 'legacy_' : 'md_') + sessionId + (isLegacy ? '.json' : '');
    const storeFileName = sessionId + "_store.json";
    const removeOptions = { force: true, recursive: true };

    fs.rmSync(sessionsDir(sessionFileName), removeOptions);
    fs.rmSync(sessionsDir(storeFileName), removeOptions);

    sessions.delete(sessionId);
    retries.delete(sessionId);

    setDeviceStatus(sessionId, 0);
};

const getChatList = (sessionId, isGroup = false) => {
    const chatType = isGroup ? "@g.us" : '@s.whatsapp.net';
    return (sessions.get(sessionId) || null).store.chats.filter(chat => {
        return chat.id.endsWith(chatType);
    });
};

const isExists = async (client, chatId, isGroup = false) => {
    try {

        let chatInfo;

        if (isGroup) {
            chatInfo = await client.groupMetadata(chatId);
            return Boolean(chatInfo.id);
        }

        if (client.isLegacy) {
            chatInfo = await client.onWhatsApp(chatId);
        } else {
            chatInfo = await client.getChatInfo(chatId);
        }

        return chatInfo.exists;
    } catch {
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
    if (phoneNumber.toString().endsWith("@s.whatsapp.net")) {
        return phoneNumber;
    }

    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, '');
    return cleanedPhoneNumber + "@s.whatsapp.net";
};

const formatGroup = (groupId) => {
    if (groupId.toString().endsWith("@g.us")) {
        return groupId;
    }

    const cleanedGroupId = groupId.replace(/[^\d-]/g, '');
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
    fs.readdirSync(sessionsDir()).forEach((fileName) => {
        if (!(fileName.startsWith("md_") || fileName.startsWith("legacy_")) || fileName.endsWith("_store")) {
            return;
        }

        const parts = fileName.replace(".json", '').split('_');
        const isLegacy = parts[0] !== 'md';
        const sessionId = isLegacy ? parts.slice(2).join('_') : parts.slice(1).join('_');

        createSession(sessionId, isLegacy);
        
    });
};

module.exports = {
    isSessionExists,
    createSession,
    getSession,
    deleteSession,
    getChatList,
    isExists,
    sendMessage,
    formatPhone,
    formatGroup,
    cleanup,
    init,
    getSessionStatus
};
