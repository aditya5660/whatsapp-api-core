const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MessageState = sequelize.define('MessageState', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    message_id: DataTypes.INTEGER,
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    notes: DataTypes.STRING,
}, {
    tableName: 'message_states',
    timestamps: true,
    paranoid: false,
    underscored: true,    
});

module.exports = MessageState;
