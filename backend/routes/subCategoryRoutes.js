const express = require('express');
const {
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  reorderSubCategory,
  toggleSubCategoryStatus,
} = require('../controller/subCategoryController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getSubCategories);
router.get('/:id', getSubCategory);

// Admin routes (protected)
router.post('/', protect, authorize('admin'), upload.single('image'), createSubCategory);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateSubCategory);
router.delete('/:id', protect, authorize('admin'), deleteSubCategory);
router.put('/:id/reorder', protect, authorize('admin'), reorderSubCategory);
router.put('/:id/toggle', protect, authorize('admin'), toggleSubCategoryStatus);

module.exports = router;
