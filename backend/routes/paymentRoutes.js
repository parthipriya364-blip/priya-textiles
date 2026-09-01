const express = require('express');
const {
  createRazorpayOrder,
  verifyAndCreateBooking,
  createCODBooking,
  getMyBookings,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  getRazorpayKey,
} = require('../controller/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/razorpay-key', getRazorpayKey);
router.get('/booking/:id', getBooking);

// Protected routes
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify-and-book', protect, verifyAndCreateBooking);
router.post('/cod-booking', createCODBooking); // Can be accessed without login
router.get('/my-bookings', protect, getMyBookings);
router.put('/booking/:id/cancel', protect, cancelBooking);

// Admin routes
router.get('/bookings', protect, authorize('admin'), getAllBookings);
router.put('/booking/:id/status', protect, authorize('admin'), updateBookingStatus);

module.exports = router;
