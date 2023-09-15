const Joi = require('joi');
const deviceService = require('../services/deviceService');
const { createSession, getSessionStatus, isSessionExists } = require('../services/whatsappService');
const ResponseUtil = require('../utils/response');
const is = require('sharp/lib/is');
const { generateRandomString } = require('../utils/general');

module.exports = {
    async getAllDevices(req, res) {
        try {
            const user = req.user;
            const devices = await deviceService.getAllDevices(user.userId);
            return ResponseUtil.ok({ res, data: devices });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res });
        }
    },

    async getDeviceById(req, res) {
        const schema = Joi.object({
            deviceId: Joi.number().integer().required(),
        });

        const { error } = schema.validate(req.params);

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }

        const deviceId = req.params.deviceId;
        try {
            const device = await deviceService.getById(deviceId);
            if (!device) {
                return ResponseUtil.notFound({ res, message: 'Device not found' });
            }
            const session = await getSessionStatus(device.phone);

            return ResponseUtil.ok({ res, data: {device, session} });
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res });
        }
    },

    async createDevice(req, res) {
        const schema = Joi.object({
            phone: Joi.string().required(),
            webhook_url: Joi.string(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }

        const device = await deviceService.getByPhone(req.body.phone, req.user.userId);
        if (device) {
            return ResponseUtil.badRequest({ res, message: 'Device already exists' });
        }

        // Generate a random string for the device token
        const token = generateRandomString();
        const deviceData = { ...req.body, user_id: req.user.userId, token };
        try {
            const newDevice = await deviceService.createDevice(deviceData);
            return ResponseUtil.created({ res, data: newDevice });
        } catch (error) {
            console.error(error);
            return ResponseUtil.badRequest({ res, message: 'Invalid device data' });
        }
    },

    async scanDevice(req, res) {
        const { deviceId } = req.params;

        try {
            const device = await deviceService.getById(deviceId);

            if (!device) {
                return ResponseUtil.notFound({ res, message: 'Device not found' });
            }          
            return await createSession(device.phone, false, res);
        } catch (error) {
            console.error(error);
            return ResponseUtil.internalError({ res, error: error });
        }
    },

    async updateDevice(req, res) {
        const paramSchema = Joi.object({
            deviceId: Joi.number().integer().required(),
        });

        const bodySchema = Joi.object({
            name: Joi.string(),
            description: Joi.string(),
        });

        const paramValidation = paramSchema.validate(req.params);
        const bodyValidation = bodySchema.validate(req.body);

        if (paramValidation.error || bodyValidation.error) {
            const errors = [
                ...(paramValidation.error ? [paramValidation.error.details[0].message] : []),
                ...(bodyValidation.error ? [bodyValidation.error.details[0].message] : []),
            ];
            return ResponseUtil.badRequest({ res, errors });
        }

        const deviceId = req.params.deviceId;
        const updatedDeviceData = req.body;
        try {
            const updatedDevice = await deviceService.updateDevice(deviceId, updatedDeviceData);
            if (!updatedDevice) {
                return ResponseUtil.notFound({ res, message: 'Device not found' });
            }
            return ResponseUtil.ok({ res, data: updatedDevice });
        } catch (error) {
            return ResponseUtil.badRequest({ res, message: 'Invalid device data' });
        }
    },

    async deleteDevice(req, res) {
        const schema = Joi.object({
            deviceId: Joi.number().integer().required(),
        });

        const { error } = schema.validate(req.params);

        if (error) {
            return ResponseUtil.badRequest({ res, message: error.details[0].message });
        }

        const deviceId = req.params.deviceId;
        try {
            const deletedDevice = await deviceService.deleteDevice(deviceId);
            if (!deletedDevice) {
                return ResponseUtil.notFound({ res, message: 'Device not found' });
            }
            return ResponseUtil.noContent({ res });
        } catch (error) {
            return ResponseUtil.internalError({ res });
        }
    },
};

