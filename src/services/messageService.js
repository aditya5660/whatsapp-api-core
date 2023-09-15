const Message = require("../models/Message");
const MessageState = require("../models/MessageState");

module.exports = {
    updateMessageByRemoteMessageId: async (remote_message_id, state) => {
        const message = await Message.findOne({
            where: {
                remote_message_id
            }
        });
        if (!message) return null;

        // Update user properties and save
        Object.assign(message, {state});
        await message.save();

        MessageState.create({
            message_id: message.id,
            state
        })
    },
}