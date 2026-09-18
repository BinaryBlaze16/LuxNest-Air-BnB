const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local uploads directory exists as fallback
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Use diskStorage so we always have the local file available, then attempt Cloudinary
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'luxnest-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP, AVIF) are allowed!'), false);
    }
  },
});

// Helper function to upload file to Cloudinary with automatic fallback to local static URL
const processUpload = async (file, folder = 'luxnest_v2') => {
  if (!file) return null;

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: 'image',
    });
    // Remove temporary local file after successful Cloudinary upload
    try {
      fs.unlinkSync(file.path);
    } catch (e) {}
    return {
      url: result.secure_url,
      filename: result.public_id,
    };
  } catch (err) {
    console.warn(` Cloudinary upload notice (${err.message}). Using high-speed local storage.`);
    // Cloudinary signature error or network failure fallback
    const port = process.env.PORT || 5050;
    const localUrl = `http://localhost:${port}/uploads/${file.filename}`;
    return {
      url: localUrl,
      filename: file.filename,
    };
  }
};

module.exports = {
  cloudinary,
  upload,
  processUpload,
};
