const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  getPublicSettings,
  resetSettings,
  updateSettingSection,
  uploadLogo,
  deleteLogo,
} = require('../controller/settingsController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/public', getPublicSettings);

// Protected routes (Admin only)
router.get('/', protect, authorize('admin'), getSettings);
router.put('/', protect, authorize('admin'), updateSettings);
router.post('/reset', protect, authorize('admin'), resetSettings);
router.patch('/:section', protect, authorize('admin'), updateSettingSection);

// Logo upload routes
router.post('/logo', protect, authorize('admin'), upload.single('logo'), uploadLogo);
router.delete('/logo', protect, authorize('admin'), deleteLogo);

module.exports = router;
