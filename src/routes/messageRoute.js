const router = require('express').Router();
const messageController = require('../controllers/messageController');
const authOrApiKeyMiddleware = require('../middlewares/authOrApiKeyMiddleware');

router.post('/send', authOrApiKeyMiddleware, messageController.sendMessage);
// router.post('/messages', authController.forceLogin);
// router.get('/messages/:id', authMiddleware, authController.me);

module.exports = router;