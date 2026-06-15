const express = require('express');
const { createDealerPurchase, getAllDealerPurchases } = require('../controllers/dealerPurchaseController');

const router = express.Router();

router.post('/', createDealerPurchase);
router.get('/', getAllDealerPurchases);

module.exports = router;
