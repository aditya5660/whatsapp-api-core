const router = require('express').Router();
const apikeyValidator = require('./../middlewares/apikeyValidator.js');
const sessionController = require('../controllers/sessionController.js');

router.get('/:sessionId', apikeyValidator, sessionController.status);
router.post('/:sessionId', apikeyValidator, sessionController.create);
router.post('/:sessionId/logout', apikeyValidator, sessionController.logout);

module.exports = router;
