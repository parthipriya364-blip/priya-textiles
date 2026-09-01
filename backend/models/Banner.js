const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    image: {
      url: {
        type: String,
        required: [true, 'Banner image URL is required'],
      },
      public_id: {
        type: String,
        required: [true, 'Banner image public_id is required'],
      },
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    link: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for sorting banners by order
bannerSchema.index({ order: 1 });

// Index for querying enabled banners
bannerSchema.index({ enabled: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
