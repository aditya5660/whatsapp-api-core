require('dotenv').config();
const express = require('express');
const nodeCleanup = require('node-cleanup');
const routes = require('./src/routes/index.js');
const whatsappService = require('./src/services/whatsappService.js');
const cors = require('cors');

const app = express();

const host = process.env.APP_URL || undefined;
const port = parseInt(process.env.APP_PORT || 3000);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', routes);

const listenerCallback = function () {
    whatsappService.init();
    console.log('Server is listening on http://' + (host ? host : 'localhost') + ':' + port);
};

if (host) {
    app.listen(port, host, listenerCallback);
} else {
    app.listen(port, listenerCallback);
}

nodeCleanup(whatsappService.cleanup);

module.exports = app;
