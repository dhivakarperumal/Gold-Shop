const express = require('express');
const {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan
} = require('../controllers/loansController');

const router = express.Router();

// Create a new loan
router.post('/', createLoan);

// Get all loans (with optional filters)
router.get('/', getLoans);

// Get a specific loan
router.get('/:id', getLoanById);

// Update a loan
router.put('/:id', updateLoan);

// Delete a loan
router.delete('/:id', deleteLoan);

module.exports = router;
