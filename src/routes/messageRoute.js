const router = require('express').Router();
const messageController = require('../controllers/messageController');

router.post('/send', messageController.sendMessage);
// router.post('/messages', authController.forceLogin);
// router.get('/messages/:id', authMiddleware, authController.me);

module.exports = router;