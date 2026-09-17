const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Import models
const Product = require('../models/Product');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const Cart = require('../models/Cart');
const Banner = require('../models/Banner');
const Review = require('../models/Review');

async function addIndexes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Product Indexes
    console.log('📦 Creating Product indexes...');
    await Product.collection.createIndex({ name: 'text', description: 'text' });
    await Product.collection.createIndex({ category: 1, subCategory: 1 });
    await Product.collection.createIndex({ price: 1 });
    await Product.collection.createIndex({ isFeatured: 1, isActive: 1 });
    await Product.collection.createIndex({ isActive: 1 });
    await Product.collection.createIndex({ createdAt: -1 });
    await Product.collection.createIndex({ category: 1, price: 1, isActive: 1 }); // Compound index
    console.log('✅ Product indexes created');

    // User Indexes
    console.log('👤 Creating User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ googleId: 1 }, { sparse: true });
    console.log('✅ User indexes created');

    // Booking Indexes
    console.log('📋 Creating Booking indexes...');
    await Booking.collection.createIndex({ user: 1, createdAt: -1 });
    await Booking.collection.createIndex({ orderStatus: 1 });
    await Booking.collection.createIndex({ paymentStatus: 1 });
    await Booking.collection.createIndex({ paymentMethod: 1 });
    await Booking.collection.createIndex({ createdAt: -1 });
    await Booking.collection.createIndex({ orderStatus: 1, createdAt: -1 }); // Compound index
    console.log('✅ Booking indexes created');

    // Category Indexes
    console.log('📂 Creating Category indexes...');
    await Category.collection.createIndex({ name: 1 });
    await Category.collection.createIndex({ slug: 1 }, { unique: true });
    await Category.collection.createIndex({ displayOrder: 1 });
    console.log('✅ Category indexes created');

    // SubCategory Indexes
    console.log('📁 Creating SubCategory indexes...');
    await SubCategory.collection.createIndex({ category: 1 });
    await SubCategory.collection.createIndex({ slug: 1 }, { unique: true });
    await SubCategory.collection.createIndex({ category: 1, displayOrder: 1 });
    await SubCategory.collection.createIndex({ isActive: 1 });
    console.log('✅ SubCategory indexes created');

    // Cart Indexes
    console.log('🛒 Creating Cart indexes...');
    await Cart.collection.createIndex({ user: 1 }, { unique: true });
    await Cart.collection.createIndex({ updatedAt: -1 });
    console.log('✅ Cart indexes created');

    // Banner Indexes
    console.log('🎨 Creating Banner indexes...');
    await Banner.collection.createIndex({ isEnabled: 1 });
    await Banner.collection.createIndex({ displayOrder: 1 });
    await Banner.collection.createIndex({ isEnabled: 1, displayOrder: 1 }); // Compound index
    console.log('✅ Banner indexes created');

    // Review Indexes
    console.log('⭐ Creating Review indexes...');
    await Review.collection.createIndex({ product: 1 });
    await Review.collection.createIndex({ user: 1 });
    await Review.collection.createIndex({ booking: 1 });
    await Review.collection.createIndex({ product: 1, createdAt: -1 });
    await Review.collection.createIndex({ rating: -1 });
    console.log('✅ Review indexes created');

    console.log('\n🎉 All indexes created successfully!');
    console.log('\n📊 Index Summary:');
    console.log('   • Products: 7 indexes');
    console.log('   • Users: 4 indexes');
    console.log('   • Bookings: 6 indexes');
    console.log('   • Categories: 3 indexes');
    console.log('   • SubCategories: 4 indexes');
    console.log('   • Carts: 2 indexes');
    console.log('   • Banners: 3 indexes');
    console.log('   • Reviews: 5 indexes');
    console.log('\n✅ Database indexing complete!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the function
addIndexes();
