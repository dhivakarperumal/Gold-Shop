const express = require('express');
const { createOrder, getOrders, getOrderById } = require('../controllers/orderController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);
router.get('/', getOrders);
router.post('/', createOrder);
router.get('/:id', getOrderById);

module.exports = router;
