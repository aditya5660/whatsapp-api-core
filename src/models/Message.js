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
    remote_message_id: DataTypes.STRING,
    remote_jid: DataTypes.STRING
}, {
    tableName: 'messages',
    timestamps: true,
    paranoid: false,
    underscored: true,    
});

module.exports = Message;
