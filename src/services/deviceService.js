const { sequelize } = require('../config/database');
const Device = require('../models/Device');

module.exports = {
    getAllDevices: async (user_id) => {
        return Device.findAll({
            attributes: ['id', 'phone', 'user_id', 'token', 'webhook_url'],
            where: {
                user_id
            }
        });
    },

    getByPhone: async (phone, user_id) => {
        return Device.findOne({
            where: { phone , user_id }
        });
    },

    getByToken: async (token) => {
        return Device.findOne({
            where: { token }
        });
    },

    getById: async (id) => {
        return Device.findOne({
            where: { id }
        });
    },

    createDevice: async (deviceData) => {
        return Device.create(deviceData);
    },

    updateDevice: async (deviceId, updatedDeviceData) => {
        return DeviceRepository.update(deviceId, updatedDeviceData);
    },

    deleteDevice: async (deviceId) => {
        // You can add additional business logic here
        return DeviceRepository.delete(deviceId);
    },

    setStatus: async (phone, status) => {
        return Device.update({ status }, { where: { phone } });
    },

    getRandomDevice: async (user_id) => {
        return Device.findOne({
            where: { user_id },
            order: sequelize.random() 
        });
    }
};
