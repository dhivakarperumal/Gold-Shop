const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage
} = require('../controllers/bannerController');

const router = express.Router();
const uploadDirectory = path.join(__dirname, '../../public/banner-images');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    fs.mkdirSync(uploadDirectory, { recursive: true });
    callback(null, uploadDirectory);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `banner-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  }
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, GIF, and WebP images are allowed'));
    }
    callback(null, true);
  }
});

router.get('/', getBanners);
router.post('/upload', imageUpload.single('file'), uploadBannerImage);
router.post('/', createBanner);
router.put('/:id', updateBanner);
router.delete('/:id', deleteBanner);

module.exports = router;
