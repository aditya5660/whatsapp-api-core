
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Device = sequelize.define('Device', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    phone: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    token: DataTypes.STRING,
    webhook_url: DataTypes.STRING,
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,    
});

module.exports = Device;