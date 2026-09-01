const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true,
  },
  recipient: {
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
  },
  emailType: {
    type: String,
    enum: ['booking_confirmation', 'status_update', 'cancellation'],
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
  },
  errorMessage: {
    type: String,
  },
  metadata: {
    oldStatus: String,
    newStatus: String,
    paymentMethod: String,
    paymentStatus: String,
    totalAmount: Number,
  },
  sentAt: {
    type: Date,
  },
}, { 
  timestamps: true 
});

// Index for efficient queries
emailSchema.index({ booking: 1, emailType: 1 });
emailSchema.index({ 'recipient.email': 1 });
emailSchema.index({ status: 1 });

module.exports = mongoose.model('Email', emailSchema);
