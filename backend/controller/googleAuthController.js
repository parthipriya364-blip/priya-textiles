const { sendTokenResponse } = require('../utils/jwt');

// @desc    Google OAuth callback handler
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res) => {
  try {
    // User is authenticated via passport
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate JWT token
    const { generateToken } = require('../utils/jwt');
    const token = generateToken(user._id);

    // Redirect to frontend with token
    // Frontend will store this token in localStorage
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }))}`);

  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

// @desc    Google OAuth failure handler
// @route   GET /api/auth/google/failure
// @access  Public
exports.googleFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
};
