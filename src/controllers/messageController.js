const whatsappService = require('../services/whatsappService');
const deviceService = require('../services/deviceService');
const Message = require('../models/Message');
const MessageState = require('../models/MessageState');

module.exports = {
    sendMessage: async (req, res) => {
        // Extract request headers and body
        const { headers, body } = req;
        const { receiver, message, file } = body;
        const apiKey = headers['x-apikey'];
        try {
            // Verify the device token (API key)
            const device = await deviceService.getByToken(apiKey);
            
            if (!device) {
                return res.status(401).json({ error: 'Invalid device token' });
            }
            const session = whatsappService.getSession(device.phone);

            // Split the receivers string into an array if multiple receivers are provided
            const receivers = receiver.split(',');

            // Send messages to each receiver
            const results = await Promise.all(
                receivers.map(async (recipient) => {
                    const formattedPhoneNumber = whatsappService.formatPhone(recipient);
                    const result = await whatsappService.sendMessage(session, formattedPhoneNumber, { "text": message });
                    // Create a message record in the messages table
                    const messageRecord = await Message.create({
                        device_id: device.id,
                        user_id: device.user_id,
                        receiver: recipient,
                        metadata: result,
                        state: 'sent',
                    });
        
                    // Create a message state in the message_states table
                    const messageState = await MessageState.create({
                        messageId: messageRecord.id, // The ID of the newly created message record
                        state: 'sent'
                    });
                    return { recipient, ...result };
                })
            );


            res.json({ results });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};
