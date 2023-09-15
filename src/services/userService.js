const User = require('../models/User');
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const { generateRandomString } = require('../utils/general');

module.exports = {
    getAllUsers: async (offset, limit) => {
        return User.findAndCountAll({
            offset,
            limit,
        });
    },

    getByEmail: async (email) => {
        return User.findOne({ 
            where: { email } 
        });
    },

    getUserById: async (id) => {
        return User.findOne({
            attributes: ['id', 'name', 'email', 'role_id','is_active'],
            where: {
                id
            }
        });
    },
    getUserByApiKey: async (api_key) => {
        return User.findOne({
            attributes: ['id', 'name', 'email', 'role_id','is_active'],
            where: {
                api_key
            }
        });
    },

    createUser: async (userData) => {
        // set password to bcrypt
        userData.password = await bcrypt.hash(userData.password, 10);
        userData.api_key = generateRandomString();
        userData.is_active = true;
        return User.create(userData);
    },

    updateUser: async (userId, updatedUserData) => {
        if (updatedUserData.password) {
            updatedUserData.password = await bcrypt.hash(updatedUserData.password, 10);
        }

        const user = await User.findByPk(userId);
        if (!user) return null;

        // Update user properties and save
        Object.assign(user, updatedUserData);
        await user.save();
        return user;
    },

    deleteUser: async (userId) => {
        const user = await User.findByPk(userId);
        if (!user) return null;
        return user.destroy();
    },
};
