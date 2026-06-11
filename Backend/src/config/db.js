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

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        mobile VARCHAR(15) NOT NULL,
        alt_phone VARCHAR(15),
        email VARCHAR(100),
        aadhar_no VARCHAR(20),
        pan_no VARCHAR(20),
        voter_id VARCHAR(50),
        kyc_status VARCHAR(50) DEFAULT 'Pending',
        permanent_address TEXT,
        current_address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        pincode VARCHAR(10),
        landmark VARCHAR(100),
        occupation VARCHAR(100),
        company_name VARCHAR(100),
        monthly_income DECIMAL(12,2),
        business_type VARCHAR(100),
        bank_account_no VARCHAR(50),
        ifsc_code VARCHAR(20),
        father_spouse_name VARCHAR(100),
        nominee_name VARCHAR(100),
        nominee_relation VARCHAR(50),
        emergency_contact_no VARCHAR(15),
        reference_name VARCHAR(100),
        reference_mobile VARCHAR(15),
        customer_photo LONGTEXT,
        aadhar_front LONGTEXT,
        aadhar_back LONGTEXT,
        pan_photo LONGTEXT,
        amount_active DECIMAL(12,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Customers table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS loans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id VARCHAR(100) NOT NULL,
        customer_name VARCHAR(100),
        customer_mobile VARCHAR(15),
        gold_items LONGTEXT,
        loan_amount DECIMAL(12,2) NOT NULL,
        interest_rate DECIMAL(5,2) DEFAULT 0,
        interest_type VARCHAR(50) DEFAULT 'Simple',
        duration INT DEFAULT 12,
        processing_fee DECIMAL(10,2) DEFAULT 0,
        valuation_charges DECIMAL(10,2) DEFAULT 0,
        gst DECIMAL(10,2) DEFAULT 0,
        loan_date DATE,
        due_date DATE,
        balance_amount DECIMAL(12,2),
        paid_amount DECIMAL(12,2) DEFAULT 0,
        interest_paid DECIMAL(12,2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
      )
    `);
    console.log('Loans table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id VARCHAR(100) NOT NULL,
        customer_name VARCHAR(100),
        loan_id INT NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        type VARCHAR(50) DEFAULT 'Settlement',
        date DATETIME,
        is_third_party TINYINT(1) DEFAULT 0,
        payer_name VARCHAR(100),
        payer_relation VARCHAR(100),
        balance DECIMAL(12,2) DEFAULT 0,
        released_to VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (loan_id) REFERENCES loans(id)
      )
    `);
    console.log('Payments table initialized');
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
