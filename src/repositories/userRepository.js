const User = require('../models/User');

module.exports = {
    findAll: async () => {
        return User.findAll();
    },

    findOne: async (userId) => {
        return User.findByPk(userId);
    },

    create: async (userData) => {
        return User.create(userData);
    },

    update: async (userId, updatedUserData) => {
        const user = await User.findByPk(userId);
        if (!user) return null;

        // Update user properties and save
        Object.assign(user, updatedUserData);
        await user.save();
        return user;
    },

    delete: async (userId) => {
        const user = await User.findByPk(userId);
        if (!user) return null;
        return user.destroy();
    },
};
