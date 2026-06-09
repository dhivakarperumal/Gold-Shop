require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');
const { randomUUID } = require('crypto');

async function run() {
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const userId = randomUUID();
  const username = 'admin';
  const email = 'admin@gmail.com';
  const phone = '';
  const role = 'admin';
  const status = 'active';

  let connection;
  try {
    connection = await pool.getConnection();
    // Ensure `role` column exists (if table pre-dates migration)
    try {
      await connection.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'");
    } catch (e) {
      // ignore if ALTER not supported or column exists
    }

    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Admin user already exists:', email);
      return process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await connection.execute(
      'INSERT INTO users (user_id, username, email, phone, role, password_hash, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, phone, role, password_hash, status]
    );

    console.log('Admin user created:');
    console.log('  email:', email);
    console.log('  password:', password);
    console.log('  user_id:', userId);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

run();
