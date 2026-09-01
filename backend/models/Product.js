const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide category'],
  },
  categoryName: {
    type: String,
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    default: null,
  },
  subCategoryName: {
    type: String,
    default: null,
  },
  // Product type (Saree, Kurta, Shirt, etc.)
  type: {
    type: String,
    trim: true,
  },
  // Main product image
  image: {
    url: {
      type: String,
      required: [true, 'Please provide product image'],
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  // Additional product images (gallery)
  gallery: [{
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
  }],
  // Pricing
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: 0,
  },
  oldPrice: {
    type: Number,
    default: null,
    min: 0,
  },
  // Stock & Inventory
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  // Product Details
  fabric: {
    type: String,
    trim: true,
  },
  colors: [{
    type: String,
    trim: true,
  }],
  sizes: [{
    type: String,
    trim: true,
  }],
  // Ratings & Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewsCount: {
    type: Number,
    default: 0,
  },
  // Tags & Features
  isNew: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isBestseller: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  // SEO
  metaTitle: {
    type: String,
    trim: true,
  },
  metaDescription: {
    type: String,
    trim: true,
  },
  // Payment Methods
  paymentMethods: {
    card: {
      type: Boolean,
      default: true,
    },
    upi: {
      type: Boolean,
      default: true,
    },
    cod: {
      type: Boolean,
      default: true,
    },
  },
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
});

// Generate slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

// Update inStock based on stock quantity
productSchema.pre('save', function(next) {
  if (this.isModified('stock')) {
    this.inStock = this.stock > 0;
  }
  next();
});

// Indexes for better query performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ subCategory: 1, isActive: 1 });
productSchema.index({ categoryName: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
