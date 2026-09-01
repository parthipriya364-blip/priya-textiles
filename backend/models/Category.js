const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name'],
    unique: true,
    trim: true,
    enum: ['Women', 'Men', 'Kids', 'Combo'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    url: {
      type: String,
      required: [true, 'Please provide category image'],
    },
    public_id: {
      type: String,
      required: true,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
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
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase();
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
