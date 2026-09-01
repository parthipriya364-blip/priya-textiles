const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all products with filters
// @route   GET /api/products?category=women&subCategory=sarees&featured=true
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { category, subCategory, featured, isNew, minPrice, maxPrice, inStock, search } = req.query;
    
    // Build query
    let query = { isActive: true };
    
    if (category) {
      query.categoryName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    }
    
    if (subCategory) {
      query.subCategoryName = subCategory.charAt(0).toUpperCase() + subCategory.slice(1).toLowerCase();
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (isNew === 'true') {
      // Calculate date 15 days ago
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      
      // Products created in the last 15 days are considered new
      query.createdAt = { $gte: fifteenDaysAgo };
    }
    
    if (inStock === 'true') {
      query.inStock = true;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { fabric: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug image')
      .populate('subCategory', 'name slug image');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      categoryName,
      subCategoryId,
      subCategoryName,
      type,
      price,
      oldPrice,
      stock,
      fabric,
      colors,
      sizes,
      isNew,
      isFeatured,
      isBestseller,
      tags,
    } = req.body;

    // Validate required fields
    if (!name || !description || !categoryId || !categoryName || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, category, and price',
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Verify subcategory if provided
    if (subCategoryId) {
      const subCategory = await SubCategory.findById(subCategoryId);
      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message: 'Subcategory not found',
        });
      }
    }

    // Check if main image is uploaded
    if (!req.files || !req.files.image) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one product image',
      });
    }

    // Upload main image to Cloudinary
    const mainImageFile = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
    const mainImageStr = `data:${mainImageFile.mimetype};base64,${mainImageFile.buffer.toString('base64')}`;
    const mainImageData = await uploadToCloudinary(mainImageStr, 'products');

    // Upload gallery images if provided
    const galleryImages = [];
    if (req.files.gallery) {
      const galleryFiles = Array.isArray(req.files.gallery) ? req.files.gallery : [req.files.gallery];
      
      for (const file of galleryFiles) {
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const imageData = await uploadToCloudinary(fileStr, 'products');
        galleryImages.push(imageData);
      }
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Parse arrays from strings if needed
    const parsedColors = typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(Boolean) : (colors || []);
    const parsedSizes = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(Boolean) : (sizes || []);
    const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (tags || []);

    // Parse payment methods
    let paymentMethods = { card: true, upi: true, cod: true };
    if (req.body.paymentMethods) {
      try {
        paymentMethods = typeof req.body.paymentMethods === 'string' 
          ? JSON.parse(req.body.paymentMethods) 
          : req.body.paymentMethods;
      } catch (e) {
        console.error('Failed to parse payment methods:', e);
      }
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      description,
      category: categoryId,
      categoryName,
      subCategory: subCategoryId || null,
      subCategoryName: subCategoryName || null,
      type: type || null,
      image: mainImageData,
      gallery: galleryImages,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      stock: stock ? Number(stock) : 0,
      fabric: fabric || null,
      colors: parsedColors,
      sizes: parsedSizes,
      isNew: isNew === 'true' || isNew === true,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isBestseller: isBestseller === 'true' || isBestseller === true,
      tags: parsedTags,
      paymentMethods,
    });

    // Populate references
    await product.populate('category', 'name slug image');
    await product.populate('subCategory', 'name slug image');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create product',
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const {
      name,
      description,
      categoryId,
      categoryName,
      subCategoryId,
      subCategoryName,
      type,
      price,
      oldPrice,
      stock,
      fabric,
      colors,
      sizes,
      isNew,
      isFeatured,
      isBestseller,
      isActive,
      tags,
    } = req.body;

    // Prepare update data
    const updateData = {};
    if (name) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (description !== undefined) updateData.description = description;
    if (categoryId) updateData.category = categoryId;
    if (categoryName) updateData.categoryName = categoryName;
    if (subCategoryId !== undefined) updateData.subCategory = subCategoryId || null;
    if (subCategoryName !== undefined) updateData.subCategoryName = subCategoryName || null;
    if (type !== undefined) updateData.type = type || null;
    if (price !== undefined) updateData.price = Number(price);
    if (oldPrice !== undefined) updateData.oldPrice = oldPrice ? Number(oldPrice) : null;
    if (stock !== undefined) {
      updateData.stock = Number(stock);
      updateData.inStock = Number(stock) > 0;
    }
    if (fabric !== undefined) updateData.fabric = fabric || null;
    if (colors !== undefined) {
      updateData.colors = typeof colors === 'string' ? colors.split(',').map(c => c.trim()).filter(Boolean) : colors;
    }
    if (sizes !== undefined) {
      updateData.sizes = typeof sizes === 'string' ? sizes.split(',').map(s => s.trim()).filter(Boolean) : sizes;
    }
    if (isNew !== undefined) updateData.isNew = isNew === 'true' || isNew === true;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isBestseller !== undefined) updateData.isBestseller = isBestseller === 'true' || isBestseller === true;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (tags !== undefined) {
      updateData.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;
    }
    
    // Update payment methods
    if (req.body.paymentMethods !== undefined) {
      try {
        updateData.paymentMethods = typeof req.body.paymentMethods === 'string' 
          ? JSON.parse(req.body.paymentMethods) 
          : req.body.paymentMethods;
      } catch (e) {
        console.error('Failed to parse payment methods:', e);
      }
    }

    // Update main image if new one uploaded
    if (req.files && req.files.image) {
      // Delete old image
      await deleteFromCloudinary(product.image.public_id);

      // Upload new image
      const mainImageFile = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
      const mainImageStr = `data:${mainImageFile.mimetype};base64,${mainImageFile.buffer.toString('base64')}`;
      const mainImageData = await uploadToCloudinary(mainImageStr, 'products');
      updateData.image = mainImageData;
    }

    // Update gallery images if new ones uploaded
    if (req.files && req.files.gallery) {
      // Delete old gallery images
      for (const img of product.gallery) {
        await deleteFromCloudinary(img.public_id);
      }

      // Upload new gallery images
      const galleryImages = [];
      const galleryFiles = Array.isArray(req.files.gallery) ? req.files.gallery : [req.files.gallery];
      
      for (const file of galleryFiles) {
        const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const imageData = await uploadToCloudinary(fileStr, 'products');
        galleryImages.push(imageData);
      }
      
      updateData.gallery = galleryImages;
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug image').populate('subCategory', 'name slug image');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update product',
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Delete main image from Cloudinary
    await deleteFromCloudinary(product.image.public_id);

    // Delete gallery images from Cloudinary
    for (const img of product.gallery) {
      await deleteFromCloudinary(img.public_id);
    }

    // Delete product from database
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
    });
  }
};

// @desc    Toggle product featured status
// @route   PUT /api/products/:id/toggle-featured
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      product,
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
    });
  }
};

// @desc    Toggle product active status
// @route   PUT /api/products/:id/toggle-active
// @access  Private/Admin
exports.toggleActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      product,
    });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle active status',
    });
  }
};
