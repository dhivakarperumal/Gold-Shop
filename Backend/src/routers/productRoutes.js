const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { createProduct, getProducts, deleteProduct, getProductById, updateProduct } = require('../controllers/productController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/product-images');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const conditionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'];
  if (contentType && contentType.toLowerCase().startsWith('multipart/form-data')) {
    upload.array('images', 10)(req, res, next);
  } else {
    next();
  }
};

router.get('/', getProducts);
router.post('/', conditionalUpload, createProduct);
router.get('/:id', getProductById);
router.put('/:id', conditionalUpload, updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
