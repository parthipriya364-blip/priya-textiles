const User = require('../models/User');
const crypto = require('crypto');
const { generateToken } = require('../utils/jwt');
const { sendPasswordResetOTP } = require('../utils/emailService');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, address, adminSecret } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Determine role based on adminSecret
    let role = 'user';
    if (adminSecret === process.env.ADMIN_SECRET) {
      role = 'admin';
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      address,
      role
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

// @desc    Get all users with order statistics
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    
    // Get all users
    const users = await User.find().select('-password').lean();
    
    // Get order statistics for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // Count total orders for this user
      const orderCount = await Booking.countDocuments({ 
        user: user._id,
        paymentStatus: { $in: ['paid', 'pending'] } // Only count successful/pending orders
      });
      
      // Calculate total purchase amount
      const orderStats = await Booking.aggregate([
        { 
          $match: { 
            user: user._id,
            paymentStatus: { $in: ['paid', 'pending'] }
          } 
        },
        { 
          $group: { 
            _id: null, 
            totalPurchase: { $sum: '$total' } 
          } 
        }
      ]);
      
      const totalPurchase = orderStats.length > 0 ? orderStats[0].totalPurchase : 0;
      
      return {
        ...user,
        orderCount,
        totalPurchase
      };
    }));
    
    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data'
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'User logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone) fieldsToUpdate.phone = phone;
    if (address) fieldsToUpdate.address = address;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Forgot password - Send OTP via email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset OTP'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 Generated OTP for', user.email, '- OTP:', otp);

    // Hash OTP before saving to database
    const bcrypt = require('bcryptjs');
    const hashedOTP = await bcrypt.hash(otp, 10);
    console.log('🔐 OTP hashed successfully');

    // Save hashed OTP and expiry to user
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });
    console.log('✅ OTP saved to database with expiry');

    // Send OTP via email
    try {
      await sendPasswordResetOTP(user.email, otp, user.name);
      console.log('✅ OTP email sent successfully to', user.email);

      res.status(200).json({
        success: true,
        message: 'Password reset OTP sent to your email'
      });
    } catch (emailError) {
      // Reset OTP fields if email fails
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email sending error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error sending email. Please try again later'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request'
    });
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔍 Verify OTP Request:', { email, otp: otp ? '***' : 'missing' });

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Trim and normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOTP = otp.toString().trim();

    console.log('🔍 Looking for user with email:', normalizedEmail);

    // Find user by email and explicitly select OTP fields (they have select: false in schema)
    const user = await User.findOne({ 
      email: normalizedEmail,
      resetPasswordOTPExpires: { $gt: Date.now() } // OTP not expired
    }).select('+resetPasswordOTP +resetPasswordOTPExpires');

    if (!user) {
      console.log('❌ User not found or OTP expired');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    console.log('✅ User found:', user.email);

    if (!user.resetPasswordOTP) {
      console.log('❌ No OTP found for user');
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.'
      });
    }

    // Verify OTP
    const bcrypt = require('bcryptjs');
    console.log('🔐 Comparing OTP...');
    const isValidOTP = await bcrypt.compare(normalizedOTP, user.resetPasswordOTP);

    if (!isValidOTP) {
      console.log('❌ Invalid OTP provided');
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    console.log('✅ OTP verified successfully');

    // Generate a reset token for the next step
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token (valid for 15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    console.log('✅ Reset token generated and saved');

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken // Send unhashed token to client
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    console.log('🔐 Reset Password Request received');
    console.log('   - resetToken:', resetToken ? '***' : 'missing');
    console.log('   - newPassword:', newPassword ? '***' : 'missing');

    if (!resetToken || !newPassword) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password'
      });
    }

    // Hash the token from request
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log('🔍 Looking for user with hashed token');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ No user found with valid reset token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
        expired: true
      });
    }

    console.log('✅ User found:', user.email);

    // Set new password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    console.log('✅ Password reset successfully for user:', user.email);

    // Generate JWT token for auto-login
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Resend OTP for password reset
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists or not
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a new OTP'
      });
    }

    // Generate new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 Resending OTP for', user.email, '- OTP:', otp);

    // Hash OTP before saving
    const bcrypt = require('bcryptjs');
    const hashedOTP = await bcrypt.hash(otp, 10);
    console.log('🔐 OTP hashed successfully');

    // Update OTP and expiry
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });
    console.log('✅ New OTP saved to database with expiry');

    // Send new OTP via email
    try {
      await sendPasswordResetOTP(user.email, otp, user.name);
      console.log('✅ New OTP email sent successfully to', user.email);

      res.status(200).json({
        success: true,
        message: 'New OTP sent to your email'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error sending email. Please try again later'
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP'
    });
  }
};
