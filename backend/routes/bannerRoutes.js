const express = require('express');
const router = express.Router();
const {
  getBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleEnabled,
  reorderBanner,
} = require('../controller/bannerController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getBanners);
router.get('/:id', getBanner);

// Admin routes
router.post('/', protect, authorize('admin'), upload.single('image'), createBanner);
router.put('/:id/toggle-enabled', protect, authorize('admin'), toggleEnabled);
router.put('/:id/reorder', protect, authorize('admin'), reorderBanner);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateBanner);
router.delete('/:id', protect, authorize('admin'), deleteBanner);

module.exports = router;
