const router = require('express').Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/force-login', authController.forceLogin);
router.get('/me', authMiddleware, authController.me);

module.exports = router;