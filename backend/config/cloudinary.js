const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with validation
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Validate credentials
if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary credentials missing in .env file');
  console.error('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
} else {
  console.log('✅ Cloudinary configured successfully');
  console.log('   Cloud Name:', cloudName);
  console.log('   API Key:', apiKey ? `${apiKey.substring(0, 4)}...` : 'missing');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
  api_proxy: null, // Ensure no proxy issues
});

// Upload image to Cloudinary with unsigned upload support
const uploadToCloudinary = async (file, folder = 'categories') => {
  try {
    // Verify credentials before upload
    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error('Cloudinary credentials not configured');
    }

    console.log(`📤 Uploading to Cloudinary folder: priya-textiles/${folder}`);
    
    // Simple upload without transformations to save quota
    const uploadOptions = {
      folder: `priya-textiles/${folder}`,
      resource_type: 'auto',
      timeout: 120000, // 2 minutes
      use_filename: true,
      unique_filename: true,
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    console.log('✅ Upload successful:', result.public_id);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('❌ Cloudinary upload error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Provide more detailed error information
    if (error.http_code === 403) {
      console.error('🔐 403 Forbidden - Your Cloudinary account has restrictions:');
      console.error('   Possible causes:');
      console.error('   1. ⚠️  Free plan monthly upload quota exceeded (25 credits/month)');
      console.error('   2. ⚠️  Account needs email verification');
      console.error('   3. ⚠️  Account is suspended or restricted');
      console.error('   4. ⚠️  Folder permissions denied');
      console.error('');
      console.error('   Solutions:');
      console.error('   ✓ Check dashboard: https://console.cloudinary.com/console/' + cloudName);
      console.error('   ✓ Verify your email address');
      console.error('   ✓ Wait for quota reset (resets monthly)');
      console.error('   ✓ Upgrade to paid plan for more credits');
      console.error('   ✓ Use a different Cloudinary account');
      
      throw new Error('Upload quota exceeded or account restricted. Please check your Cloudinary dashboard and verify your email.');
    } else if (error.http_code === 401) {
      throw new Error('Invalid Cloudinary API credentials');
    } else if (error.http_code === 400) {
      throw new Error('Invalid image format or data');
    } else if (error.http_code === 420) {
      throw new Error('Cloudinary rate limit exceeded. Please wait and try again.');
    }
    
    throw new Error(`Cloudinary upload failed: ${error.message || 'Unknown error'}`);
  }
};

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image: ${publicId}`);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
