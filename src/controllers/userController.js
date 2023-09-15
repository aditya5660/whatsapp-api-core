const Joi = require('joi');
const userService = require('../services/userService');
const ResponseUtil = require('../utils/response');

module.exports = {
    async getAllUsers(req, res) {
        try {
            const schema = Joi.object({
                page: Joi.number().integer().min(1).default(1),
                limit: Joi.number().integer().min(1).default(10),
            });

            const { error, value } = schema.validate(req.query);

            if (error) {
                return ResponseUtil.badRequest({ res, message: error.details[0].message });
            }

            const { page, limit } = value;
            const offset = (page - 1) * limit;
            const users = await userService.getAllUsers(offset, limit);
            return ResponseUtil.ok({ res, message: 'Users found', data: users });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res, message: 'Internal Server Error', error });
        }
    },

    async getUserById(req, res) {
        const schema = Joi.object({
            userId: Joi.number().integer().required(),
        });

        const { error } = schema.validate({ userId: req.params.userId });

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }

        const userId = req.params.userId;
        try {
            const user = await userService.getUserById(userId);
            if (!user) {
                return ResponseUtil.notFound({ res, message: 'User not found' });
            }
            return ResponseUtil.ok({ res, data: user });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res, message: 'Internal Server Error', error });
        }
    },

    async createUser(req, res) {
        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            role_id: Joi.number().integer().required(),
            password: Joi.string().min(6).required(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }

        const user = await userService.getByEmail(req.body.email);
        if (user) {
            return ResponseUtil.badRequest({ res, message: 'User already exists' });
        }

        const userData = req.body;
        try {
            const newUser = await userService.createUser(userData);
            return ResponseUtil.created({ res, message: 'User created', data: newUser });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res, message: 'Internal Server Error', error });
        }
    },

    async updateUser(req, res) {
        const schema = Joi.object({
            name: Joi.string(),
            password: Joi.string().min(6),
            userId: Joi.number().integer().required(),
            email: Joi.string().email(),
            role_id: Joi.number().integer(),
        });

        const { error } = schema.validate({ ...req.body, ...req.params });

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }

        const userId = req.params.userId;
        const updatedUserData = req.body;
        try {
            const updatedUser = await userService.updateUser(userId, updatedUserData);
            if (!updatedUser) {
                return ResponseUtil.notFound({ res, message: 'User not found' });
            }
            return ResponseUtil.ok({ res, message: 'User updated' });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res, message: 'Internal Server Error', error });
        }
    },

    async deleteUser(req, res) {
        const schema = Joi.object({
            userId: Joi.number().integer().required(),
        });

        const { error } = schema.validate({ userId: req.params.userId });

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }

        const userId = req.params.userId;
        try {
            const deletedUser = await userService.deleteUser(userId);
            if (!deletedUser) {
                return ResponseUtil.notFound({ res, message: 'User not found' });
            }
            return ResponseUtil.ok({ res, message: 'User deleted' });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res, message: 'Internal Server Error', error });
        }
    },
};
