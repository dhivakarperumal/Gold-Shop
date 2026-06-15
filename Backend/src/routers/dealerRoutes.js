const express = require('express');
const {
  createDealer,
  getDealers,
  getDealerById,
  updateDealer,
  deleteDealer,
  getDealerPurchases,
  getDealerPayments
} = require('../controllers/dealerController');

const router = express.Router();

router.post('/', createDealer);
router.get('/', getDealers);
router.get('/:id', getDealerById);
router.put('/:id', updateDealer);
router.delete('/:id', deleteDealer);
router.get('/:dealerId/purchases', getDealerPurchases);
router.get('/:dealerId/payments', getDealerPayments);

module.exports = router;
