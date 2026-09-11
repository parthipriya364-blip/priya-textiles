const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Please login again.'
        });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.'
        });
      }

      // Check if user changed password after token was issued
      if (req.user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          message: 'Password was recently changed. Please login again.'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or has expired. Please login again.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Optional protect - attach user if token exists, but allow request to continue
exports.optionalProtect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, continue without user
    if (!token) {
      return next();
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      // If user found and active, attach to request
      if (req.user && req.user.isActive && !req.user.changedPasswordAfter(decoded.iat)) {
        console.log('✅ Optional auth: User authenticated:', req.user._id);
      } else {
        req.user = null;
      }
    } catch (error) {
      // Token invalid, but that's okay for optional auth
      req.user = null;
    }

    next();
  } catch (error) {
    // Error during optional auth, continue without user
    req.user = null;
    next();
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
