const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middlewares/authMiddleware');
const authOrApiKeyMiddleware = require('../middlewares/authOrApiKeyMiddleware');

router.get('/', authMiddleware, deviceController.getAllDevices);
router.get('/:deviceId', authMiddleware, deviceController.getDeviceById);
router.post('/', authMiddleware, deviceController.createDevice);
router.post('/:devicePhone/scan', authOrApiKeyMiddleware, deviceController.scanDevice);
router.post('/:devicePhone/logout', authOrApiKeyMiddleware, deviceController.logoutDevice);
router.put('/:deviceId', authMiddleware, deviceController.updateDevice);
router.delete('/:deviceId', authMiddleware, deviceController.deleteDevice);

module.exports = router;
