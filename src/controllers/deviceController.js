const Joi = require('joi');
const deviceService = require('../services/deviceService');
const { createSession } = require('../services/whatsappService');

module.exports = {
    getAllDevices: async (req, res) => {
        try {
            const user = req.user;
            const devices = await deviceService.getAllDevices(req?.user.userId);
            res.json(devices);
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getDeviceById: async (req, res) => {
        // Define a schema to validate the device ID parameter
        const schema = Joi.object({
            deviceId: Joi.number().integer().required(),
        });

        // Validate the device ID parameter
        const { error } = schema.validate(req.params);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const deviceId = req.params.deviceId;
        try {
            const device = await deviceService.getDeviceById(deviceId);
            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
            }
            res.json(device);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    createDevice: async (req, res) => {
        const schema = Joi.object({
            phone: Joi.string().required(),
            webhook_url: Joi.string(),
        });

        const { error } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const device = await deviceService.getByPhone(req.body.phone, req.user.userId);
        if (device) {
            return res.status(400).json({ error: 'device already exists' });
        }
        // generate random string for device token
        const token = generateRandomString()
        const deviceData = {...req.body, user_id: req.user.userId, token };
        try {
            const newDevice = await deviceService.createDevice(deviceData);
            res.status(201).json(newDevice);
        } catch (error) {
            console.log(error);
            res.status(400).json({ error: 'Invalid device data' });
        }
    },

    scanDevice: async (req, res) => {
        const { deviceId } = req.params;

        try {
            // Find the device by deviceId number
            const device = await deviceService.getById(deviceId);

            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
            }

            // Call WhatsApp Service's createSession method based on the device's phone number
            await createSession(device.phone,false, res);

            // Handle the sessionData as needed (e.g., return it in the response)
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updateDevice: async (req, res) => {
        // Define a schema to validate the device ID parameter and request body
        const paramSchema = Joi.object({
            deviceId: Joi.number().integer().required(),
        });

        const bodySchema = Joi.object({
            name: Joi.string(),
            description: Joi.string(),
            // Add more validation for other fields as needed
        });

        // Validate the device ID parameter and request body
        const paramValidation = paramSchema.validate(req.params);
        const bodyValidation = bodySchema.validate(req.body);

        if (paramValidation.error || bodyValidation.error) {
            const errors = [
                ...(paramValidation.error ? [paramValidation.error.details[0].message] : []),
                ...(bodyValidation.error ? [bodyValidation.error.details[0].message] : []),
            ];
            return res.status(400).json({ errors });
        }

        const deviceId = req.params.deviceId;
        const updatedDeviceData = req.body;
        try {
            const updatedDevice = await deviceService.updateDevice(deviceId, updatedDeviceData);
            if (!updatedDevice) {
                return res.status(404).json({ error: 'Device not found' });
            }
            res.json(updatedDevice);
        } catch (error) {
            res.status(400).json({ error: 'Invalid device data' });
        }
    },

    deleteDevice: async (req, res) => {
        // Define a schema to validate the device ID parameter
        const schema = Joi.object({
            deviceId: Joi.number().integer().required(),
        });

        // Validate the device ID parameter
        const { error } = schema.validate(req.params);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const deviceId = req.params.deviceId;
        try {
            const deletedDevice = await deviceService.deleteDevice(deviceId);
            if (!deletedDevice) {
                return res.status(404).json({ error: 'Device not found' });
            }
            res.status(204).send(); // No content on success
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

function generateRandomString(length = 20) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
}