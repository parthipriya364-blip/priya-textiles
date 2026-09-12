const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getPublicSettings,
  resetSettings,
  updateSettingSection,
} = require('../controller/settingsController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/public', getPublicSettings);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin'), getSettings);
router.put('/', protect, authorize('admin'), updateSettings);
router.post('/reset', protect, authorize('admin'), resetSettings);
router.patch('/:section', protect, authorize('admin'), updateSettingSection);

module.exports = router;
