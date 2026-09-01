const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Store Information
  storeName: {
    type: String,
    required: true,
    trim: true,
    default: 'Priya Textiles',
  },
  storeEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    default: 'support@priyatextiles.com',
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    default: '+91 98765 43210',
  },
  address: {
    type: String,
    required: true,
    trim: true,
    default: 'Coimbatore, Tamil Nadu, India',
  },
  storeDescription: {
    type: String,
    trim: true,
    default: '',
    maxlength: 1000,
  },
  
  // Logo
  logo: {
    type: String,
    default: '',
  },
  logoPublicId: {
    type: String,
    default: '',
  },
  
  // Social Media
  instagram: {
    type: String,
    trim: true,
    default: 'instagram.com/priyatextiles',
  },
  facebook: {
    type: String,
    trim: true,
    default: 'facebook.com/priyatextiles',
  },
  twitter: {
    type: String,
    trim: true,
    default: '',
  },
  youtube: {
    type: String,
    trim: true,
    default: '',
  },
  whatsapp: {
    type: String,
    trim: true,
    default: '',
  },
  
  // Business Information
  gstNumber: {
    type: String,
    trim: true,
    default: '',
  },
  
  // Shipping Configuration
  shippingCharge: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  freeShippingThreshold: {
    type: Number,
    min: 0,
    default: 0,
  },
  
  // Email Configuration
  supportEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'support@priyatextiles.com',
  },
  
  // Store Policies
  returnPolicy: {
    type: String,
    trim: true,
    default: '',
  },
  privacyPolicy: {
    type: String,
    trim: true,
    default: '',
  },
  termsAndConditions: {
    type: String,
    trim: true,
    default: '',
  },
  
  // SEO Settings
  metaTitle: {
    type: String,
    trim: true,
    default: 'Priya Textiles - Premium Textile Shop',
  },
  metaDescription: {
    type: String,
    trim: true,
    default: 'Shop premium quality textiles and fabrics at Priya Textiles',
  },
  metaKeywords: {
    type: String,
    trim: true,
    default: 'textiles, fabrics, clothing, sarees, dress materials',
  },
  
  // Business Hours
  businessHours: {
    monday: { type: String, default: '9:00 AM - 6:00 PM' },
    tuesday: { type: String, default: '9:00 AM - 6:00 PM' },
    wednesday: { type: String, default: '9:00 AM - 6:00 PM' },
    thursday: { type: String, default: '9:00 AM - 6:00 PM' },
    friday: { type: String, default: '9:00 AM - 6:00 PM' },
    saturday: { type: String, default: '9:00 AM - 6:00 PM' },
    sunday: { type: String, default: 'Closed' },
  },
  
  // Notification Settings
  emailNotifications: {
    orderConfirmation: { type: Boolean, default: true },
    statusUpdates: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
  },
  
  // Currency Settings
  currency: {
    code: { type: String, default: 'INR' },
    symbol: { type: String, default: '₹' },
  },
  
  // Tax Settings
  taxRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  taxIncluded: {
    type: Boolean,
    default: true,
  },
  
  // Maintenance Mode
  maintenanceMode: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: 'We are currently under maintenance. Please check back soon.' },
  },
  
  // Last Updated
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { 
  timestamps: true 
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Update settings
settingsSchema.statics.updateSettings = async function(updates, userId) {
  let settings = await this.findOne();
  if (!settings) {
    settings = new this(updates);
  } else {
    Object.assign(settings, updates);
  }
  settings.lastUpdatedBy = userId;
  await settings.save();
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
