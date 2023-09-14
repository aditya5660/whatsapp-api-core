const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');


const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: DataTypes.INTEGER,
    device_id: DataTypes.INTEGER,
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    metadata: DataTypes.JSON,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
});

module.exports = Message;
