const express = require('express');
const passport = require('passport');
const {
  signup,
  login,
  getUsers,
  getMe,
  logout,
  updatePassword,
  updateProfile,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendOTP
} = require('../controller/authController');
const {
  googleCallback,
  googleFailure
} = require('../controller/googleAuthController');
const { protect, authorize } = require('../middleware/auth');
const { 
  ipRateLimiter, 
  checkAccountLockout 
} = require('../middleware/rateLimiter');

const router = express.Router();

// Regular authentication routes with rate limiting
router.post('/signup', ipRateLimiter, signup);
router.post('/login', ipRateLimiter, checkAccountLockout, login);
router.get('/users', protect, authorize('admin'), getUsers);

// Password reset routes (public with rate limiting)
router.post('/forgot-password', ipRateLimiter, forgotPassword);
router.post('/verify-otp', ipRateLimiter, verifyResetOTP);
router.post('/reset-password', ipRateLimiter, resetPassword);
router.post('/resend-otp', ipRateLimiter, resendOTP);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/google/failure',
    session: false 
  }),
  googleCallback
);

router.get('/google/failure', googleFailure);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/updatepassword', protect, updatePassword);
router.put('/updateprofile', protect, updateProfile);

module.exports = router;
