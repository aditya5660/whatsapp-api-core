const whatsappService = require('../services/whatsappService.js');
const responseHelper = require('./../utils/response.js');

const validate = function (req, res, next) {
    const sessionId = req.query.id || req.params.id;

    if (!whatsappService.isSessionExists(sessionId)) {
        return responseHelper(res, 404, false, 'Session not found.');
    }

    res.locals.sessionId = sessionId;
    next();
};

module.exports = validate;
