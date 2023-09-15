const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, deviceController.getAllDevices);
router.get('/:deviceId', authMiddleware, deviceController.getDeviceById);
router.post('/', authMiddleware, deviceController.createDevice);
router.post('/:deviceId/scan', authMiddleware, deviceController.scanDevice);
router.put('/:deviceId', authMiddleware, deviceController.updateDevice);
router.delete('/:deviceId', authMiddleware, deviceController.deleteDevice);

module.exports = router;
