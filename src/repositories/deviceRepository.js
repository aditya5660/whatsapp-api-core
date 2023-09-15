const Device = require('../models/Device');

module.exports = {
    findAll: async () => {
        return Device.findAll();
    },

    findOne: async (deviceId) => {
        return Device.findByPk(deviceId);
    },

    create: async (deviceData) => {
        return Device.create(deviceData);
    },

    update: async (deviceId, updatedDeviceData) => {
        const device = await Device.findByPk(deviceId);
        if (!device) return null;

        // Update device properties and save
        Object.assign(device, updatedDeviceData);
        await device.save();
        return device;
    },

    delete: async (deviceId) => {
        const device = await Device.findByPk(deviceId);
        if (!device) return null;
        return device.destroy();
    },
};
