const router = require('express').Router();
const { body, query } = require('express-validator');
const requestValidator = require('./../middlewares/requestValidator.js');
const sessionValidator = require('./../middlewares/sessionValidator.js');
const controller = require('./../controllers/groupsController.js');
const getMessages = require('./../controllers/getMessages.js');
const apikeyValidator = require('./../middlewares/apikeyValidator.js');


router.get('/', query('id').notEmpty(), requestValidator, sessionValidator, apikeyValidator, controller.getList);

router.get('/:jid', query('id').notEmpty(), requestValidator, sessionValidator, apikeyValidator, getMessages);

router.get('/meta/:jid', query('id').notEmpty(), requestValidator, sessionValidator, apikeyValidator, controller.getGroupMetaData);

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

module.exports = router;
