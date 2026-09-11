const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
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
