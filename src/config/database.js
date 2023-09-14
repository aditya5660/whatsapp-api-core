const { Sequelize } = require('sequelize');
// DB_NAME
// DB_USER
// DB_PASSWORD=
// DB_HOST_REPLICA=
// DB_HOST
// DB_PORT
// DB_LOGGING
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbLogging = process.env.DB_LOGGING;
// Define your database credentials and connection options here
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: (dbLogging) ? console.log : false
});

module.exports = {
    sequelize,
};