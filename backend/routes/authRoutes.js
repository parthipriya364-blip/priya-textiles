const express = require('express');
const passport = require('passport');
const {
  signup,
  login,
  getUsers,
  getMe,
  logout,
  updatePassword,
  updateProfile
} = require('../controller/authController');
const {
  googleCallback,
  googleFailure
} = require('../controller/googleAuthController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Regular authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/users', protect, authorize('admin'), getUsers);

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
