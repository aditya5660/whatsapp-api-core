const router = require('express').Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Define routes for user-related operations
router.get('/', authMiddleware, UserController.getAllUsers);
router.get('/:userId', authMiddleware, UserController.getUserById);
router.post('/', authMiddleware, UserController.createUser);
router.put('/:userId', authMiddleware, UserController.updateUser);
router.delete('/:userId', authMiddleware, UserController.deleteUser);

module.exports = router;
