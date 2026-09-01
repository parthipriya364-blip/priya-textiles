const Settings = require('../models/Settings');
const { cloudinary, uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message,
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate required fields
    if (updates.storeName && updates.storeName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Store name is required',
      });
    }

    if (updates.storeEmail && updates.storeEmail.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Store email is required',
      });
    }

    // Update settings
    const settings = await Settings.updateSettings(updates, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
};

// @desc    Upload logo
// @route   POST /api/settings/logo
// @access  Private/Admin
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a logo image',
      });
    }

    // Get current settings
    const settings = await Settings.getSettings();

    // Delete old logo from Cloudinary if exists
    if (settings.logoPublicId) {
      try {
        await deleteFromCloudinary(settings.logoPublicId);
      } catch (err) {
        console.error('Failed to delete old logo:', err);
      }
    }

    // Upload new logo to Cloudinary using buffer (memoryStorage)
    const imageStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const imageData = await uploadToCloudinary(imageStr, 'settings');

    // Update settings with new logo
    settings.logo = imageData.url;
    settings.logoPublicId = imageData.public_id;
    settings.lastUpdatedBy = req.user.id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      logo: imageData.url,
      settings,
    });
    
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message,
    });
  }
};

// @desc    Delete logo
// @route   DELETE /api/settings/logo
// @access  Private/Admin
exports.deleteLogo = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    if (!settings.logo) {
      return res.status(400).json({
        success: false,
        message: 'No logo to delete',
      });
    }

    // Delete from Cloudinary
    try {
      if (settings.logoPublicId) {
        await deleteFromCloudinary(settings.logoPublicId);
      }
    } catch (err) {
      console.error('Failed to delete logo from Cloudinary:', err);
    }

    // Remove logo from settings
    settings.logo = '';
    settings.logoPublicId = '';
    settings.lastUpdatedBy = req.user.id;
    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Logo deleted successfully',
      settings,
    });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete logo',
      error: error.message,
    });
  }
};

// @desc    Get public settings (for frontend display)
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    
    // Return only public-facing settings
    const publicSettings = {
      storeName: settings.storeName,
      storeEmail: settings.storeEmail,
      phone: settings.phone,
      address: settings.address,
      instagram: settings.instagram,
      facebook: settings.facebook,
      twitter: settings.twitter,
      youtube: settings.youtube,
      supportEmail: settings.supportEmail,
      businessHours: settings.businessHours,
      currency: settings.currency,
      shippingCharge: settings.shippingCharge,
      freeShippingThreshold: settings.freeShippingThreshold,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      returnPolicy: settings.returnPolicy,
      privacyPolicy: settings.privacyPolicy,
      termsAndConditions: settings.termsAndConditions,
      maintenanceMode: settings.maintenanceMode,
    };
    
    res.status(200).json({
      success: true,
      settings: publicSettings,
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public settings',
      error: error.message,
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private/Admin
exports.resetSettings = async (req, res) => {
  try {
    // Delete existing settings
    await Settings.deleteMany({});
    
    // Create new default settings
    const settings = await Settings.create({
      lastUpdatedBy: req.user.id,
    });
    
    res.status(200).json({
      success: true,
      message: 'Settings reset to default values',
      settings,
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message,
    });
  }
};

// @desc    Update specific setting section
// @route   PATCH /api/settings/:section
// @access  Private/Admin
exports.updateSettingSection = async (req, res) => {
  try {
    const { section } = req.params;
    const updates = req.body;
    
    const validSections = [
      'store',
      'social',
      'business',
      'shipping',
      'email',
      'policies',
      'seo',
      'hours',
      'notifications',
      'currency',
      'tax',
      'maintenance',
    ];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings section',
      });
    }
    
    const settings = await Settings.getSettings();
    
    // Update only the specified section
    switch (section) {
      case 'store':
        if (updates.storeName) settings.storeName = updates.storeName;
        if (updates.storeEmail) settings.storeEmail = updates.storeEmail;
        if (updates.phone) settings.phone = updates.phone;
        if (updates.address) settings.address = updates.address;
        break;
      case 'social':
        if (updates.instagram !== undefined) settings.instagram = updates.instagram;
        if (updates.facebook !== undefined) settings.facebook = updates.facebook;
        if (updates.twitter !== undefined) settings.twitter = updates.twitter;
        if (updates.youtube !== undefined) settings.youtube = updates.youtube;
        break;
      case 'business':
        if (updates.gstNumber !== undefined) settings.gstNumber = updates.gstNumber;
        break;
      case 'shipping':
        if (updates.shippingCharge !== undefined) settings.shippingCharge = updates.shippingCharge;
        if (updates.freeShippingThreshold !== undefined) settings.freeShippingThreshold = updates.freeShippingThreshold;
        break;
      case 'notifications':
        if (updates.emailNotifications) settings.emailNotifications = updates.emailNotifications;
        break;
      case 'maintenance':
        if (updates.maintenanceMode) settings.maintenanceMode = updates.maintenanceMode;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Section update not implemented',
        });
    }
    
    settings.lastUpdatedBy = req.user.id;
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: `${section} settings updated successfully`,
      settings,
    });
  } catch (error) {
    console.error('Update setting section error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings section',
      error: error.message,
    });
  }
};
