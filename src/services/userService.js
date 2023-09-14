const User = require('../models/User');
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');

module.exports = {
    getAllUsers: async () => {
        return userRepository.findAll();
    },

    getUserById: async (userId) => {
        return userRepository.findOne(userId);
    },

    createUser: async (userData) => {
        // set password to bcrypt
        userData.password = await bcrypt.hash(userData.password, 10);
        userData.is_active = true;
        return userRepository.create(userData);
    },

    updateUser: async (userId, updatedUserData) => {
        if (updatedUserData.password) {
            updatedUserData.password = await bcrypt.hash(updatedUserData.password, 10);
        }
        return userRepository.update(userId, updatedUserData);
    },

    deleteUser: async (userId) => {
        return userRepository.delete(userId);
    },
};
