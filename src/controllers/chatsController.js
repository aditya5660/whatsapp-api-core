const whatsappService = require('../services/whatsappService.js');
const responseHelper = require('../utils/response.js');

const getList = (req, res) => {
  const chatList = whatsappService.getChatList(res.locals.sessionId);
  return responseHelper(res, 200, true, '', chatList);
};

const send = async function (req, res) {
    const session = whatsappService.getSession(res.locals.sessionId);
    const receiver = whatsappService.formatPhone(req.body.receiver);
    const delay = req.body.delay || 0;
    const message = req.body.message;

    try {
        // const exists = await whatsappService.isExists(session, receiver);

        // if (!exists) {
        //     return responseHelper(res, 400, false, 'The receiver number does not exist.');
        // }

        await whatsappService.sendMessage(session, receiver, message, delay);

        responseHelper(res, 200, true, 'The message has been successfully sent.');
    } catch (err) {
        console.log(err);
        responseHelper(res, 500, false, 'Failed to send the message.');
    }
};

const sendBulk = async function (req, res) {
    const session = whatsappService.getSession(res.locals.sessionId);
    const errors = [];

    for (const _i = 0, _a = req.body; _i < _a.length; _i++) {
        const data = _a[_i];
        const receiver = data.receiver, message = data.message, delay = data.delay;

        if (!receiver || !message) {
            errors.push(_i);

            continue;
        }

        if (!delay || isNaN(delay)) {
            delay = 1000;
        }

        receiver = whatsappService.formatPhone(receiver);

        try {
            const exists = await whatsappService.isExists(session, receiver);

            if (!exists) {
                errors.push(_i);

                continue;
            }

            await whatsappService.sendMessage(session, receiver, message, delay);
        } catch {
            errors.push(_i);
        }
    }

    if (errors.length === 0) {
        return responseHelper(res, 200, true, 'All messages have been successfully sent.');
    }

    const isAllFailed = errors.length === req.body.length;

    responseHelper(
        res,
        isAllFailed ? 500 : 200,
        !isAllFailed,
        isAllFailed ? 'Failed to send all messages.' : 'Some messages have been successfully sent.',
        { errors: errors }
    );
};

module.exports = { getList: getList, send: send, sendBulk: sendBulk };
