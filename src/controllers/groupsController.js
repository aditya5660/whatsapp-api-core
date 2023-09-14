
const { getSession, getChatList, isExists, sendMessage, formatGroup } = require('../services/whatsappService.js');
const responseHelper = require('./../utils/response.js');

const getList = (req, res) => {
    return responseHelper(res, 200, true, '', getChatList(res.locals.sessionId, true));
}

const getGroupMetaData = async (req, res) => {
    const session = getSession(res.locals.sessionId);
    const { jid } = req.params;

    try {
        const data = await session.groupMetadata(jid);

        if (!data.id) {
            return responseHelper(res, 400, false, 'The group is not exists.');
        }

        responseHelper(res, 200, true, '', data);
    } catch {
        responseHelper(res, 500, false, 'Failed to get group metadata.');
    }
}

const send = async (req, res) => {
    const session = getSession(res.locals.sessionId);
    const receiver = formatGroup(req.body.receiver);
    const { message } = req.body;

    try {
        const exists = await isExists(session, receiver, true);

        if (!exists) {
            return responseHelper(res, 400, false, 'The group is not exists.');
        }

        await sendMessage(session, receiver, message);

        responseHelper(res, 200, true, 'The message has been successfully sent.');
    } catch {
        responseHelper(res, 500, false, 'Failed to send the message.');
    }
}

module.exports = { getList, getGroupMetaData, send };
