const router = require('express').Router();
const messageController = require('../controllers/messageController');
const apikeyValidator = require('../middlewares/apikeyValidator');

router.post('/send', apikeyValidator, messageController.sendMessage);

module.exports = router;