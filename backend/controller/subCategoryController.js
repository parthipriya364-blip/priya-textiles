const SubCategory = require('../models/SubCategory');
const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all subcategories or by category
// @route   GET /api/subcategories?category=women
// @access  Public
exports.getSubCategories = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      // Find by category name
      query.categoryName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    }

    const subcategories = await SubCategory.find(query)
      .populate('category', 'name slug')
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: subcategories.length,
      subcategories,
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategories',
    });
  }
};

// @desc    Get single subcategory
// @route   GET /api/subcategories/:id
// @access  Public
exports.getSubCategory = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id).populate('category', 'name slug');

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    res.status(200).json({
      success: true,
      subcategory,
    });
  } catch (error) {
    console.error('Get subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subcategory',
    });
  }
};

// @desc    Create subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId, categoryName, description, displayOrder } = req.body;

    // Validate required fields
    if (!name || !categoryId || !categoryName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, categoryId and categoryName',
      });
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found',
      });
    }

    // Check if image file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload subcategory image',
      });
    }

    // Check if subcategory already exists in this category
    const existing = await SubCategory.findOne({ name, category: categoryId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory already exists in this category',
      });
    }

    // Convert buffer to base64 for Cloudinary
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const imageData = await uploadToCloudinary(fileStr, 'subcategories');

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Create subcategory
    const subcategory = await SubCategory.create({
      name,
      slug,
      category: categoryId,
      categoryName,
      description,
      image: imageData,
      displayOrder: displayOrder || 0,
    });

    // Populate category data
    await subcategory.populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      subcategory,
    });
  } catch (error) {
    console.error('Create subcategory error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create subcategory',
    });
  }
};

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, description, displayOrder, isActive } = req.body;

    let subcategory = await SubCategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    // Prepare update data
    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (description !== undefined) updateData.description = description;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If new image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      await deleteFromCloudinary(subcategory.image.public_id);

      // Upload new image
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const imageData = await uploadToCloudinary(fileStr, 'subcategories');
      updateData.image = imageData;
    }

    // Update subcategory
    subcategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Subcategory updated successfully',
      subcategory,
    });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update subcategory',
    });
  }
};

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
exports.deleteSubCategory = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(subcategory.image.public_id);

    // Delete subcategory from database
    await subcategory.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subcategory',
    });
  }
};

// @desc    Reorder subcategories
// @route   PUT /api/subcategories/:id/reorder
// @access  Private/Admin
exports.reorderSubCategory = async (req, res) => {
  try {
    const { direction } = req.body; // 'up' or 'down'

    const subcategory = await SubCategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    const currentOrder = subcategory.displayOrder;

    // Find adjacent subcategory to swap with
    const swapQuery = {
      category: subcategory.category,
      displayOrder: direction === 'up' ? currentOrder - 1 : currentOrder + 1,
    };

    const swapSubcategory = await SubCategory.findOne(swapQuery);

    if (swapSubcategory) {
      // Swap display orders
      subcategory.displayOrder = swapSubcategory.displayOrder;
      swapSubcategory.displayOrder = currentOrder;

      await subcategory.save();
      await swapSubcategory.save();
    }

    res.status(200).json({
      success: true,
      message: 'Subcategory reordered successfully',
    });
  } catch (error) {
    console.error('Reorder subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder subcategory',
    });
  }
};

// @desc    Toggle subcategory status
// @route   PUT /api/subcategories/:id/toggle
// @access  Private/Admin
exports.toggleSubCategoryStatus = async (req, res) => {
  try {
    const subcategory = await SubCategory.findById(req.params.id);

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    subcategory.isActive = !subcategory.isActive;
    await subcategory.save();

    res.status(200).json({
      success: true,
      message: `Subcategory ${subcategory.isActive ? 'enabled' : 'disabled'} successfully`,
      subcategory,
    });
  } catch (error) {
    console.error('Toggle subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle subcategory status',
    });
  }
};
