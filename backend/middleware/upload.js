const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Export single file upload middleware
const uploadSingle = upload.single('image');

// Export multiple files upload middleware
const uploadMultiple = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 5 }
]);

module.exports = upload;
module.exports.uploadSingle = uploadSingle;
module.exports.uploadMultiple = uploadMultiple;
