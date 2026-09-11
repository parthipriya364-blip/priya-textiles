const Banner = require('../models/Banner');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const MAX_BANNERS = 5;

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = async (req, res) => {
  try {
    const { enabled } = req.query;
    
    let query = {};
    if (enabled === 'true') {
      query.enabled = true;
    }

    const banners = await Banner.find(query).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
    });
  }
};

// @desc    Get single banner
// @route   GET /api/banners/:id
// @access  Public
exports.getBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    res.status(200).json({
      success: true,
      banner,
    });
  } catch (error) {
    console.error('Get banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner',
    });
  }
};

// @desc    Create banner
// @route   POST /api/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const { link } = req.body;

    // Check banner limit
    const bannerCount = await Banner.countDocuments();
    if (bannerCount >= MAX_BANNERS) {
      return res.status(400).json({
        success: false,
        message: `Maximum of ${MAX_BANNERS} banners allowed`,
      });
    }

    // Check if image is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a banner image',
      });
    }

    // Upload image to Cloudinary
    const imageStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const imageData = await uploadToCloudinary(imageStr, 'banners');

    // Get the next order number
    const maxOrderBanner = await Banner.findOne().sort({ order: -1 });
    const nextOrder = maxOrderBanner ? maxOrderBanner.order + 1 : 1;

    // Create banner
    const banner = await Banner.create({
      image: imageData,
      link: link || null,
      order: nextOrder,
      enabled: true,
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner,
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create banner',
    });
  }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    let banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    const { link, enabled } = req.body;

    // Prepare update data
    const updateData = {};
    if (link !== undefined) updateData.link = link || null;
    if (enabled !== undefined) updateData.enabled = enabled === 'true' || enabled === true;

    // Update image if new one uploaded
    if (req.file) {
      // Delete old image
      await deleteFromCloudinary(banner.image.public_id);

      // Upload new image
      const imageStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const imageData = await uploadToCloudinary(imageStr, 'banners');
      updateData.image = imageData;
    }

    // Update banner
    banner = await Banner.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      banner,
    });
  } catch (error) {
    console.error('Update banner error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update banner',
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(banner.image.public_id);

    // Delete banner from database
    await banner.deleteOne();

    // Reorder remaining banners
    const remainingBanners = await Banner.find().sort({ order: 1 });
    for (let i = 0; i < remainingBanners.length; i++) {
      remainingBanners[i].order = i + 1;
      await remainingBanners[i].save();
    }

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (error) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner',
    });
  }
};

// @desc    Toggle banner enabled status
// @route   PUT /api/banners/:id/toggle-enabled
// @access  Private/Admin
exports.toggleEnabled = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    banner.enabled = !banner.enabled;
    await banner.save();

    res.status(200).json({
      success: true,
      message: `Banner ${banner.enabled ? 'enabled' : 'disabled'} successfully`,
      banner,
    });
  } catch (error) {
    console.error('Toggle enabled error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle banner status',
    });
  }
};

// @desc    Reorder banners
// @route   PUT /api/banners/:id/reorder
// @access  Private/Admin
exports.reorderBanner = async (req, res) => {
  try {
    const { direction } = req.body; // 'up' or 'down'

    if (!direction || !['up', 'down'].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: 'Direction must be "up" or "down"',
      });
    }

    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found',
      });
    }

    const currentOrder = banner.order;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    // Find the banner to swap with
    const swapBanner = await Banner.findOne({ order: newOrder });

    if (!swapBanner) {
      return res.status(400).json({
        success: false,
        message: 'Cannot move banner in that direction',
      });
    }

    // Swap orders
    banner.order = newOrder;
    swapBanner.order = currentOrder;

    await banner.save();
    await swapBanner.save();

    const banners = await Banner.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: 'Banner reordered successfully',
      banners,
    });
  } catch (error) {
    console.error('Reorder banner error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder banner',
    });
  }
};
