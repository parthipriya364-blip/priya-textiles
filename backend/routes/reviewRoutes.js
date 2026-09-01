const express = require('express');
const router = express.Router();
const {
  createReview,
  getAllReviews,
  getProductReviews,
  getMyReviews,
  canReviewBooking,
  deleteReview,
} = require('../controller/reviewController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes (logged in users)
router.post('/', protect, createReview);
router.get('/my-reviews', protect, getMyReviews);
router.get('/can-review/:bookingId', protect, canReviewBooking);

// Admin routes
router.get('/', protect, authorize('admin'), getAllReviews);
router.delete('/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
