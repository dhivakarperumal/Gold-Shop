const express = require('express');
const { createDealerPayment, getAllDealerPayments } = require('../controllers/dealerPaymentController');

const router = express.Router();

router.post('/', createDealerPayment);
router.get('/', getAllDealerPayments);

module.exports = router;
