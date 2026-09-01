const mongoose = require('mongoose');

const bookingItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, default: 'Free Size' },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: { type: [bookingItemSchema], required: true },
  customer: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  subtotal: { type: Number, required: true, min: 0 },
  shipping: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['cod', 'upi', 'card'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'paid' },
  orderStatus: { 
    type: String, 
    enum: ['confirmed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'], 
    default: 'confirmed' 
  },
  razorpayOrderId: { type: String, unique: true, sparse: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
