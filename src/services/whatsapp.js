'use strict';

const { Boom } = require("@hapi/boom");
const { default: makeWASocket } = require("@whiskeysockets/baileys");
const {
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
} = require("@whiskeysockets/baileys");
const { DisconnectReason } = require('@whiskeysockets/baileys');
const QRCode = require("qrcode");
const fs = require('fs');

let sock = [];
let qrcode = [];
let intervalStore = [];

const { setStatus } = require('./database/index');
const { IncomingMessage } = require("./controllers/incomingMessage");
const { formatReceipt } = require('./lib/helper');
const axios = require("axios");
const MAIN_LOGGER = require('./lib/pino');
const logger = MAIN_LOGGER.child({});

const connectToWhatsApp = async (token, socket = null) => {
    if (typeof qrcode[token] !== "undefined") {
        if (socket !== null) {
          socket.emit("qrcode", {
            'token': token,
            'data': qrcode[token],
            'message': "please scan with your Whatsapp Account"
          });
        }
        return {
          'status': false,
          'sock': sock[token],
          'qrcode': qrcode[token],
          'message': "Please scan QR code"
        };
      }
    
      try {
        let userIdParts = sock[token].user.id.split(':');
        userIdParts = userIdParts[0] + "@s.whatsapp.net";
        const profilePictureUrl = await getPpUrl(token, userIdParts);
    
        if (socket !== null) {
          socket.emit("connection-open", {
            'token': token,
            'user': sock[token].user,
            'ppUrl': profilePictureUrl
          });
          console.log(sock[token].user);
        }
    
        return {
          'status': true,
          'message': "Already connected"
        };
      } catch (error) {
        if (socket !== null) {
          socket.emit('message', {
            'token': token,
            'message': "Connecting.. (1)"
          });
        }
      }
    
      const { version: waVersion, isLatest: isLatestVersion } = await fetchLatestBaileysVersion();
      console.log("You're using WhatsApp Gateway M Pedia v5.0.0 - Contact admin if any trouble: 082298859671");
      console.log("Using WA v" + waVersion.join('.') + ", isLatest: " + isLatestVersion);
    
      const { state: authState, saveCreds: saveCredentials } = await useMultiFileAuthState('./credentials/' + token);
    
      sock[token] = makeWASocket({
        'version': waVersion,
        'browser': ["M Pedia", 'Chrome', '103.0.5060.114'],
        'logger': logger,
        'printQRInTerminal': true,
        'auth': {
          'creds': authState.creds,
          'keys': makeCacheableSignalKeyStore(authState.keys, logger)
        },
        'generateHighQualityLinkPreview': true
      });
    
      sock[token].ev.process(async event => {
        if (event["connection.update"]) {
          const connectionUpdate = event["connection.update"];
          const { connection, lastDisconnect, qr } = connectionUpdate;
    
          if (connection === "close") {
            console.log('close');
            if ((lastDisconnect?.["error"] instanceof Boom)?.["output"]?.["statusCode"] !== DisconnectReason.loggedOut) {
              delete qrcode[token];
    
              if (socket != null) {
                socket.emit("message", {
                  'token': token,
                  'message': "Connecting.."
                });
              }
    
              if (lastDisconnect.error?.['output']?.["payload"]?.["message"] === "QR refs attempts ended") {
                delete qrcode[token];
                sock[token].ws.close();
    
                if (socket != null) {
                  socket.emit("message", {
                    'token': token,
                    'message': "Request QR ended. Reload scan to request QR again"
                  });
                }
    
                return;
              }
    
              if (lastDisconnect?.["error"]['output']['payload']["message"] != "Stream Errored (conflict)") {
                connectToWhatsApp(token, socket);
              }
            } else {
              setStatus(token, "Disconnect");
              console.log("Connection closed. You are logged out.");
    
              if (socket !== null) {
                socket.emit("message", {
                  'token': token,
                  'message': "Connection closed. You are logged out."
                });
              }
    
              clearConnection(token);
            }
          }
    
          if (qr) {
            QRCode.toDataURL(qr, function (error, dataURL) {
              if (error) {
                console.log(error);
              }
              qrcode[token] = dataURL;
              if (socket !== null) {
                socket.emit("qrcode", {
                  'token': token,
                  'data': dataURL,
                  'message': "Please scan with your Whatsapp Account"
                });
              }
            });
          }
    
            if (connection === "open") {
              setStatus(token, "Connected");
            let userParts = sock[token].user.id.split(':');
            userParts = userParts[0] + "@s.whatsapp.net";
            const profilePicture = await getPpUrl(token, userParts);
    
            if (socket !== null) {
              socket.emit('connection-open', {
                'token': token,
                'user': sock[token].user,
                'ppUrl': profilePicture
              });
            }
    
            delete qrcode[token];
          }
        }
    
        if (event["messages.upsert"]) {
          const messagesUpsert = event["messages.upsert"];
          IncomingMessage(messagesUpsert, sock[token]);
        }
    
        if (event["creds.update"]) {
          const credsUpdate = event["creds.update"];
          saveCredentials(credsUpdate);
        }
      });
    
      return {
        'sock': sock[token],
        'qrcode': qrcode[token]
      };
  return {
    'sock': sock[token],
    'qrcode': qrcode[token]
  };
};

async function connectWaBeforeSend(token) {
    let isConnected = undefined;
  let socket;

  socket = await connectToWhatsApp(token);

  await socket.sock.ev.on("connection.update", connectionUpdate => {
    const { connection, qr } = connectionUpdate;

    if (connection === 'open') {
      isConnected = true;
    }

    if (qr) {
      isConnected = false;
    }
  });

  let retries = 0;
  while (typeof isConnected === "undefined") {
    retries++;
    if (retries > 4) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return isConnected;
}

const sendText = async (token, receiptId, message) => {
    try {
        const result = await sock[token].sendMessage(formatReceipt(receiptId), {
          'text': message
        });
    
        console.log(result);
        return result;
      } catch (error) {
        console.log(error);
        return false;
      }
};

const sendImage = async (token, receiptId, base64Data, mimeType, caption = '') => {
  try {
    const result = await sock[token].sendImage(formatReceipt(receiptId), {
      'imageBase64': base64Data,
      'mimetype': mimeType,
      'caption': caption
    });

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const sendFile = async (token, receiptId, base64Data, mimeType, filename, caption = '') => {
  try {
    const result = await sock[token].sendDocument(formatReceipt(receiptId), {
      'document': base64Data,
      'mimetype': mimeType,
      'filename': filename,
      'caption': caption
    });

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const sendLink = async (token, receiptId, url, title = '', description = '') => {
  try {
    const result = await sock[token].sendLink(formatReceipt(receiptId), {
      'url': url,
      'title': title,
      'description': description
    });

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const sendLocation = async (token, receiptId, latitude, longitude, name = '', address = '') => {
  try {
    const result = await sock[token].sendLocation(formatReceipt(receiptId), {
      'degreesLatitude': latitude,
      'degreesLongitude': longitude,
      'name': name,
      'address': address
    });

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const sendContact = async (token, receiptId, phone, name = '') => {
  try {
    const result = await sock[token].sendContact(formatReceipt(receiptId), {
      'phone': phone,
      'name': name
    });

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const sendSticker = async (token, receiptId, base64Data) => {
  try {
    const result = await sock[token].sendSticker(formatReceipt(receiptId), base64Data);

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Add more functions as needed...

module.exports = {
  'connectToWhatsApp': connectToWhatsApp,
  'connectWaBeforeSend': connectWaBeforeSend,
  'sendText': sendText,
  'sendImage': sendImage,
  'sendFile': sendFile,
  'sendLink': sendLink,
  'sendLocation': sendLocation,
  'sendContact': sendContact,
  'sendSticker': sendSticker,
  // Add any additional functions here...
};
