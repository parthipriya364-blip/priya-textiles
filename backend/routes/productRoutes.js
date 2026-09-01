const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
  toggleActive,
} = require('../controller/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Admin routes (protected)
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]),
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'gallery', maxCount: 5 }
  ]),
  updateProduct
);

router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.put('/:id/toggle-featured', protect, authorize('admin'), toggleFeatured);
router.put('/:id/toggle-active', protect, authorize('admin'), toggleActive);

module.exports = router;
