const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
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
    api_key: DataTypes.STRING,
}, {
    timestamps: true,
    paranoid: false,
    underscored: true,
});

module.exports = User;
