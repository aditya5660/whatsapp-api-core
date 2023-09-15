require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userService = require('../services/userService');
const Joi = require('joi');
const secretKey = process.env.SECRET_KEY;
const ResponseUtil = require('../utils/response');

module.exports = {
    login: async (req, res) => {
        const schema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().min(6).required(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return ResponseUtil.badRequest({res, message: error.details[0].message , error});
        }
        const { email, password } = req.body;

        try {
            const user = await userService.getByEmail(email);

            if (!user) {
                return ResponseUtil.unauthorized({
                    res,
                    message: 'User Not Found',
                });
            }

            if (!bcrypt.compareSync(password, user.password)) {
                return ResponseUtil.unauthorized({
                    res,
                    message: 'Invalid Password',
                });
            }

            const token = jwt.sign({ userId: user.id, roleId: user.roleId }, secretKey, {
                expiresIn: '12h',
            });
            return ResponseUtil.ok({
                res,
                message: 'Login successful',
                data: { token },
            });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({res, message: 'Internal Server Error', error});
        }
    },

    me: async (req, res) => {
        const { userId } = req.user;
        const user = await userService.getUserById(userId);
        if (!user) {
            return ResponseUtil.badRequest({res, message: 'User not found'});
        }
        return ResponseUtil.ok({res, message: 'User found', data: user});
    },

    forceLogin: async (req, res) => {
        if (process.env.NODE_ENV !== 'local') {
            return ResponseUtil.badRequest({res, message: 'Force login is only allowed in local environment'});
        }

        const schema = Joi.object({
            email: Joi.string().required(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const email = req.body.email;
        try {
            const user = await userService.getByEmail(email);

            if (!user) {
                return ResponseUtil.unauthorized({
                    res,
                    message: 'User Not Found',
                });
            }

            const token = jwt.sign({ userId: user.id, roleId: user.roleId }, secretKey, {
                expiresIn: '12h',
            });
            
            return ResponseUtil.ok({
                res,
                message: 'Login successful',
                data: { token },
            })
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({res, message: 'Internal Server Error', error});
        }
    },
};
