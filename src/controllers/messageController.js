const Message = require('../models/Message');
const MessageState = require('../models/MessageState');
const deviceService = require('../services/deviceService');
const whatsappService = require('../services/whatsappService');
const { getSessionStatus, getSession } = require('../services/whatsappService');
const { categorizeFile } = require('../utils/general');
const ResponseUtil = require('../utils/response');


module.exports = {
    sendMessage: async (req, res) => {
        // Extract request headers and body
        const { headers, body } = req;
        const { receiver, message, file } = body;
        const user = req.user;
        try {
            // Verify the device token (API key)
            const device = await deviceService.getByPhone(body.sender, user.userId);
            
            if (!device) {
                return ResponseUtil.unauthorized({ res ,message: 'Device Not Found' });
            }
    
            const sessionStatus = await whatsappService.getSessionStatus(device.phone);
            
            if(sessionStatus.status == 'disconnected'){
                return ResponseUtil.badRequest({ res, message: 'Device not connected' });
            }
    
            const session = await whatsappService.getSession(device.phone);

            // Split the receivers string into an array if multiple receivers are provided
            const receivers = receiver.split(',');
            
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

            // Send messages to each receiver
            const results = await Promise.all(
                receivers.map(async (recipient) => {
                    const formattedPhoneNumber = whatsappService.formatPhone(recipient);
                    
                    const result = await whatsappService.sendMessage(session, formattedPhoneNumber, formattedMessage);
                    // Create a message record in the messages table
                    const messageRecord = await Message.create({
                        device_id: device.id,
                        user_id: device.user_id,
                        receiver: recipient,
                        metadata: result,
                        state: result.status,
                        message: message,
                        file: file,
                        remote_message_id: result.key.id,
                        remote_jid: result.key.remoteJid 
                    });
        
                    const messageState = await MessageState.create({
                        message_id: messageRecord.id, 
                        state: result.status
                    });
                    return { recipient, ...result };
                })
            );
    
    
            return ResponseUtil.ok({ res, data: results, message: 'Message sent' });
        } catch (error) {
            console.log(error);
            return ResponseUtil.internalError({ res ,error });
        }
    },
};
