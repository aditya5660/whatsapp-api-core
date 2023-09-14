const express = require('express');
const { body, query } = require('express-validator');
const requestValidator = require('./../middlewares/requestValidator.js');
const sessionValidator = require('./../middlewares/sessionValidator.js');
const controller = require('./../controllers/chatsController.js');
const getMessages = require('./../controllers/getMessages.js');
const apikeyValidator = require('../middlewares/apikeyValidator.js');

const router = express.Router();

router.get('/', query('id').notEmpty(), requestValidator, sessionValidator, apikeyValidator, controller.getList);

router.get('/:jid', query('id').notEmpty(), requestValidator, sessionValidator, apikeyValidator, getMessages);

router.post(
    '/send',
    query('id').notEmpty(),
    body('receiver').notEmpty(),
    body('message').notEmpty(),
    requestValidator,
    sessionValidator,
    apikeyValidator,
    controller.send
);

router.post('/send-bulk', query('id').notEmpty(), requestValidator, sessionValidator, apikeyValidator, controller.sendBulk);

module.exports = router;
