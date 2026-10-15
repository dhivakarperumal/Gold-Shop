const express = require('express');
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);
router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

module.exports = router;
