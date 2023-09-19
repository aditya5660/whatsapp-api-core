const Joi = require('joi');
const whatsappService = require('../services/whatsappService');
const { categorizeFile } = require('../utils/general');
const ResponseUtil = require('../utils/response');


module.exports = {
    sendMessage: async (req, res) => {
        
        const schema = Joi.object({
            sender: Joi.string().required(),
            receiver: Joi.string().required(),
            message: Joi.string().required(),
            file: Joi.string()
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }
        // Extract request headers and body
        const { headers, body } = req;
        const { receiver, message, file, sender } = body;
        try {
    
            const sessionStatus = await whatsappService.getSessionStatus(sender);
            
            if(sessionStatus.status == 'disconnected'){
                return ResponseUtil.badRequest({ res, message: 'Session not connected' });
            }
    
            const session = await whatsappService.getSession(sender);

            const receivers = receiver.split('|');
            
            let formattedMessage = {
                text: message,
            };
        
            if (file) {
                const categoryFile = categorizeFile(file);

                formattedMessage = {
                    caption: message,
                    ...categoryFile
                } 
            }

            const results = [];
            console.log(receivers);
            for (const recipient of receivers) {
                const formattedPhoneNumber = whatsappService.formatPhone(recipient);
                try {
                    const result = await whatsappService.sendMessage(session, formattedPhoneNumber, formattedMessage, 1000);
                    results.push({ recipient, ...result });
                } catch (error) {
                    // Handle the error if needed
                    console.error(`Failed to send message to recipient ${recipient}: ${error}`);
                }
            }
    
    
            return ResponseUtil.ok({ res, data: results, message: 'Message sent' });
        } catch (error) {
            console.log(error);
            return ResponseUtil.internalError({ res ,error });
        }
    },
};
