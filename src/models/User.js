const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role_id: DataTypes.INTEGER,
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_active: DataTypes.BOOLEAN,
    token: DataTypes.STRING,
    token_expired_at: DataTypes.DATE,
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});

module.exports = User;
