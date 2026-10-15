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
          phone: user.phone || '',
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

async function updateProfile(req, res) {
  const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
  const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';

  if (!username || username.length > 50) {
    return res.status(400).json({ message: 'Name is required and must be 50 characters or fewer' });
  }
  if (phone.length > 15) {
    return res.status(400).json({ message: 'Phone number must be 15 characters or fewer' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE users SET username = ?, phone = ? WHERE user_id = ?',
      [username, phone || null, req.user.user_id]
    );
    if (result.affectedRows === 0) {
      const [rows] = await pool.execute(
        'SELECT user_id FROM users WHERE user_id = ?',
        [req.user.user_id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Account not found' });
      }
    }
    return res.json({ message: 'Profile updated', user: { username, phone } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'That name is already in use' });
    }
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    return res.status(400).json({ message: 'New password must be between 8 and 128 characters' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT password_hash FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' });
    }
    const matches = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!matches) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [passwordHash, req.user.user_id]
    );
    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ message: 'Failed to change password' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  updateProfile,
  changePassword
};
