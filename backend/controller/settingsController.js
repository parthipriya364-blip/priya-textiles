const Settings = require('../models/Settings');

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
