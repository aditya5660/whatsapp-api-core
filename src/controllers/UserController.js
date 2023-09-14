const Joi = require('joi');
const userService = require('../services/userService');

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getUserById: async (req, res) => {
        const schema = Joi.object({
            userId: Joi.number().integer().required(),
        });

        const { error } = schema.validate({ userId: req.params.userId });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.params.userId;
        try {
            const user = await userService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    createUser: async (req, res) => {
        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            role_id: Joi.number().integer().required(),
            password: Joi.string().min(6).required(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userData = req.body;
        try {
            const newUser = await userService.createUser(userData);
            res.status(201).json(newUser);
        } catch (error) {
            console.log(error);
            res.status(400).json({ error: 'Invalid user data' });
        }
    },

    updateUser: async (req, res) => {
        const schema = Joi.object({
            name: Joi.string(),
            password: Joi.string().min(6),
            userId: Joi.number().integer().required(),
            email: Joi.string().email(),
            role_id: Joi.number().integer(),
        });

        const { error } = schema.validate({
            userId: req.params.userId,
            email: req.body.email,
            role_id: req.body.role_id,
        });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.params.userId;
        const updatedUserData = req.body;
        try {
            const updatedUser = await userService.updateUser(userId, updatedUserData);
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(updatedUser);
        } catch (error) {
            res.status(400).json({ error: 'Invalid user data' });
        }
    },

    deleteUser: async (req, res) => {
        const schema = Joi.object({
            userId: Joi.number().integer().required(),
        });

        const { error } = schema.validate({ userId: req.params.userId });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const userId = req.params.userId;
        try {
            const deletedUser = await userService.deleteUser(userId);
            if (!deletedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.status(204).send(); // No content on success
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};
