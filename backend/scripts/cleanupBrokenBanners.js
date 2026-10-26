const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: '../.env' });

const Banner = require('../models/Banner');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Check if an image URL is accessible
const checkImageUrl = async (url) => {
  try {
    const response = await axios.head(url, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Main cleanup function
const cleanupBrokenBanners = async () => {
  try {
    console.log('🔍 Starting banner cleanup...\n');

    // Get all banners
    const banners = await Banner.find();
    console.log(`📊 Found ${banners.length} banners in database\n`);

    if (banners.length === 0) {
      console.log('ℹ️  No banners found in database');
      return;
    }

    let brokenCount = 0;
    let validCount = 0;
    const brokenBanners = [];

    // Check each banner
    for (const banner of banners) {
      const imageUrl = banner.image?.url || banner.image;
      console.log(`Checking banner ${banner._id}...`);
      console.log(`  URL: ${imageUrl}`);

      const isValid = await checkImageUrl(imageUrl);

      if (isValid) {
        console.log(`  ✅ Valid\n`);
        validCount++;
      } else {
        console.log(`  ❌ Broken (404)\n`);
        brokenCount++;
        brokenBanners.push(banner);
      }
    }

    // Summary
    console.log('\n📋 Summary:');
    console.log(`  Valid banners: ${validCount}`);
    console.log(`  Broken banners: ${brokenCount}`);

    // Remove broken banners if any
    if (brokenBanners.length > 0) {
      console.log('\n🗑️  Removing broken banners...');

      for (const banner of brokenBanners) {
        await Banner.findByIdAndDelete(banner._id);
        console.log(`  Deleted banner ${banner._id}`);
      }

      // Reorder remaining banners
      const remainingBanners = await Banner.find().sort({ order: 1 });
      for (let i = 0; i < remainingBanners.length; i++) {
        remainingBanners[i].order = i + 1;
        await remainingBanners[i].save();
      }

      console.log(`\n✅ Cleanup complete! Removed ${brokenBanners.length} broken banner(s)`);
      console.log(`📊 Remaining banners: ${remainingBanners.length}`);
    } else {
      console.log('\n✅ All banners are valid! No cleanup needed.');
    }
  } catch (error) {
    console.error('\n❌ Cleanup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

// Run the script
(async () => {
  await connectDB();
  await cleanupBrokenBanners();
  process.exit(0);
})();
