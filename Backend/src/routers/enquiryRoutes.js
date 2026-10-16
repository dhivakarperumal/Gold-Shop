const express = require('express');
const {
  submitEnquiry,
  getEnquiries,
  updateEnquiry,
  deleteEnquiry,
  requireAdmin
} = require('../controllers/enquiryController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.post('/', submitEnquiry);
router.use(requireAuth, requireAdmin);
router.get('/', getEnquiries);
router.patch('/:id', updateEnquiry);
router.delete('/:id', deleteEnquiry);

module.exports = router;
