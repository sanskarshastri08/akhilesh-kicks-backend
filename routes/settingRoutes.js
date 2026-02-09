const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', settingController.getSettings);
router.put('/shipping', protect, admin, settingController.updateShippingSettings);
router.put('/general', protect, admin, settingController.updateGeneralSettings);

module.exports = router;
