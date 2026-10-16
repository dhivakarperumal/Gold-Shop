const express = require('express');
const {
  getWishlist,
  addWishlistItem,
  removeWishlistItem
} = require('../controllers/wishlistController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);
router.get('/', getWishlist);
router.post('/', addWishlistItem);
router.delete('/:productId', removeWishlistItem);

module.exports = router;
