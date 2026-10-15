const express = require('express');
const {
  getCart,
  addCartItem,
  replaceCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);
router.get('/', getCart);
router.post('/', addCartItem);
router.put('/', replaceCart);
router.patch('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);
router.delete('/', clearCart);

module.exports = router;
