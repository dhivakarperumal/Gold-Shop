const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');

// Register User
async function registerUser(req, res) {
  const { user_id, username, email, phone, password, status } = req.body;

  try {
    // Validate input
    if (!user_id || !username || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const connection = await pool.getConnection();
    try {
      // Check if user already exists
      const [existingUser] = await connection.execute(
        'SELECT email FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Insert user
      await connection.execute(
        'INSERT INTO users (user_id, username, email, phone, password_hash, status) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, username, email, phone, password_hash, status || 'active']
      );

      res.status(201).json({ 
        message: 'Registration successful',
        user_id: user_id,
        username: username,
        email: email
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
}

// Login User
async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign({ user_id: user.user_id, username: user.username, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

      res.json({
        message: 'Login successful',
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

module.exports = {
  registerUser,
  loginUser
};

