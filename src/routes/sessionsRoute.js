const express = require('express');
const { body } = require('express-validator');
const requestValidator = require('./../middlewares/requestValidator.js');
const sessionValidator = require('./../middlewares/sessionValidator.js');
const controller = require('./../controllers/sessionsController.js');
const apikeyValidator = require('./../middlewares/apikeyValidator.js');

const router = express.Router();

router.get('/find/:id', sessionValidator, apikeyValidator, controller.find);

router.get('/server-status', apikeyValidator, controller.find);

router.get('/status/:id', sessionValidator, apikeyValidator, controller.status);

router.post('/add', body('id').notEmpty(), body('isLegacy').notEmpty(), requestValidator, apikeyValidator, controller.add);

router.delete('/delete/:id', sessionValidator, apikeyValidator, controller.del);

module.exports = router;
