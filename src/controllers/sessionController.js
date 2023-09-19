const Joi = require('joi');
const { createSession, getSessionStatus, deleteSession } = require('../services/whatsappService');
const ResponseUtil = require('../utils/response');

module.exports = {

    async status(req, res) {
        const schema = Joi.object({
            sessionId: Joi.string().required(),
        });

        const { error } = schema.validate(req.params);

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }

        const {sessionId} = req.params;
        try {
            
            const session = await getSessionStatus(sessionId);

            return ResponseUtil.ok({ res, data: { session} });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res });
        }
    },

    async create(req, res) {
        const schema = Joi.object({
            sessionId: Joi.required(),
        });
        const { error } = schema.validate(req.params);

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }
        const { sessionId } = req.params;

        try {        
            await createSession(sessionId, false, res);
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res, error: error });
        }
    },

    async logout (req, res) {
        const schema = Joi.object({
            sessionId: Joi.required(),
        });
        const { error } = schema.validate(req.params);

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }
        const { sessionId } = req.params;
        try {          
            await deleteSession(sessionId, false);

            return ResponseUtil.ok({ res,data: null, message: 'Session deleted' });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res, error: error });
        }
    },
};

