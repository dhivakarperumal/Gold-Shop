const express = require('express');
const { registerUser, loginUser, updateProfile, changePassword } = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Registration endpoint
router.post('/register', registerUser);
// Login endpoint
router.post('/login', loginUser);
router.put('/profile', requireAuth, updateProfile);
router.put('/password', requireAuth, changePassword);

module.exports = router;
