const express = require('express');
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

const router = express.Router();

// Create a new customer
router.post('/', createCustomer);

// Get all customers
router.get('/', getCustomers);

// Get a specific customer
router.get('/:id', getCustomerById);

// Update a customer
router.put('/:id', updateCustomer);

// Delete a customer
router.delete('/:id', deleteCustomer);

module.exports = router;
