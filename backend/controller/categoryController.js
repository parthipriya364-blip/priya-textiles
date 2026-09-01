const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
    });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
    });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description, order } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name',
      });
    }

    // Validate category name
    const validCategories = ['Women', 'Men', 'Kids', 'Combo'];
    if (!validCategories.includes(name)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(', ')}`,
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    // Check if image file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload category image',
      });
    }

    // Convert buffer to base64 for Cloudinary
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const imageData = await uploadToCloudinary(fileStr, 'categories');

    // Create category
    const category = await Category.create({
      name,
      slug: name.toLowerCase(),
      description,
      image: imageData,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category',
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, order, isActive } = req.body;

    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (name) updateData.slug = name.toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If new image is uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      await deleteFromCloudinary(category.image.public_id);

      // Upload new image
      const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      const imageData = await uploadToCloudinary(fileStr, 'categories');
      updateData.image = imageData;
    }

    // Update category
    category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update category',
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Delete image from Cloudinary
    await deleteFromCloudinary(category.image.public_id);

    // Delete category from database
    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
    });
  }
};

// @desc    Initialize default categories
// @route   POST /api/categories/init
// @access  Private/Admin
exports.initializeCategories = async (req, res) => {
  try {
    const defaultCategories = [
      { name: 'Women', slug: 'women', description: 'Women\'s clothing and accessories', order: 1 },
      { name: 'Men', slug: 'men', description: 'Men\'s clothing and accessories', order: 2 },
      { name: 'Kids', slug: 'kids', description: 'Kids\' clothing and accessories', order: 3 },
      { name: 'Combo', slug: 'combo', description: 'Combo offers and bundles', order: 4 },
    ];

    const createdCategories = [];

    for (const catData of defaultCategories) {
      // Check if category exists
      const existing = await Category.findOne({ name: catData.name });
      if (!existing) {
        // For initialization, you'll need to provide default images
        // or skip image requirement temporarily
        const category = await Category.create({
          ...catData,
          image: {
            url: `https://via.placeholder.com/800x800?text=${catData.name}`,
            public_id: `default-${catData.slug}`,
          },
        });
        createdCategories.push(category);
      }
    }

    res.status(200).json({
      success: true,
      message: `Initialized ${createdCategories.length} categories`,
      categories: createdCategories,
    });
  } catch (error) {
    console.error('Initialize categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize categories',
    });
  }
};
