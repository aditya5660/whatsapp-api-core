const User = require('../models/User');
const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');

module.exports = {
    getAllUsers: async () => {
        return User.findAll();
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

    createUser: async (userData) => {
        // set password to bcrypt
        userData.password = await bcrypt.hash(userData.password, 10);
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
