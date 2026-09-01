const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  booking: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Booking', 
    required: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 1000
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  orderDate: {
    type: Date,
    required: true
  }
}, { 
  timestamps: true 
});

// Index to prevent duplicate reviews for same product in same booking
reviewSchema.index({ booking: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
