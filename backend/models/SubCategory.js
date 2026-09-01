const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide subcategory name'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide parent category'],
  },
  categoryName: {
    type: String,
    required: true,
    enum: ['Women', 'Men', 'Kids', 'Combo'],
  },
  image: {
    url: {
      type: String,
      required: [true, 'Please provide subcategory image'],
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  productsCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Generate slug from name before saving
subCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

// Compound index for category and name uniqueness
subCategorySchema.index({ category: 1, name: 1 }, { unique: true });

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;
