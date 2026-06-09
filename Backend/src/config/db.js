const mysql = require('mysql2/promise');

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gold_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize Database
async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    // Create users table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15),
        role VARCHAR(20) DEFAULT 'user',
        password_hash VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image TEXT,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        featured TINYINT(1) DEFAULT 0,
        subcategories TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Categories table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        sub_category VARCHAR(100),
        brand VARCHAR(100),
        purity VARCHAR(50),
        hallmark TINYINT(1) DEFAULT 0,
        certificate VARCHAR(100),
        weight DECIMAL(10,3),
        weight_unit VARCHAR(20),
        coin_weight VARCHAR(50),
        making_charges DECIMAL(10,2),
        wastage_percentage DECIMAL(5,2),
        price DECIMAL(10,2),
        offer_price DECIMAL(10,2),
        discount DECIMAL(5,2),
        stock INT DEFAULT 0,
        sku VARCHAR(100),
        gender VARCHAR(50),
        occasion TEXT,
        color VARCHAR(50),
        material VARCHAR(50),
        size TEXT,
        length_options TEXT,
        description TEXT,
        features TEXT,
        dimensions TEXT,
        shipping TEXT,
        return_policy TEXT,
        seo TEXT,
        images TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        featured TINYINT(1) DEFAULT 0,
        best_seller TINYINT(1) DEFAULT 0,
        new_arrival TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Products table initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  initializeDatabase
};
