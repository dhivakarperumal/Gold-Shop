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

async function migrateOrderIdsToAutoIncrement(connection) {
  const [orderIdColumns] = await connection.execute(
    `SELECT DATA_TYPE, EXTRA
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'id'`
  );
  const orderIdColumn = orderIdColumns[0];
  if (!orderIdColumn) {
    throw new Error('Cannot migrate orders.id because the column does not exist');
  }
  if (orderIdColumn.DATA_TYPE === 'int' && orderIdColumn.EXTRA.includes('auto_increment')) {
    return;
  }

  const [references] = await connection.execute(
    `SELECT TABLE_NAME, CONSTRAINT_NAME
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE CONSTRAINT_SCHEMA = DATABASE()
       AND REFERENCED_TABLE_NAME = 'orders'
       AND REFERENCED_COLUMN_NAME = 'id'`
  );
  const unsupportedReferences = references.filter((reference) => reference.TABLE_NAME !== 'order_items');
  if (unsupportedReferences.length > 0) {
    throw new Error('Cannot migrate orders.id while other tables reference it');
  }
  const orderItemsReference = references.find((reference) => reference.TABLE_NAME === 'order_items');

  await connection.execute('DROP TEMPORARY TABLE IF EXISTS order_id_map');
  await connection.execute(`
    CREATE TEMPORARY TABLE order_id_map (
      new_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      old_id CHAR(36) NOT NULL UNIQUE
    )
  `);
  await connection.execute(
    'INSERT INTO order_id_map (old_id) SELECT id FROM orders ORDER BY created_at, id'
  );
  await connection.execute('ALTER TABLE orders ADD COLUMN numeric_order_id INT NULL');
  await connection.execute('ALTER TABLE order_items ADD COLUMN numeric_order_id INT NULL');
  await connection.execute(
    `UPDATE orders o
     JOIN order_id_map m ON m.old_id = o.id
     SET o.numeric_order_id = m.new_id`
  );
  await connection.execute(
    `UPDATE order_items oi
     JOIN order_id_map m ON m.old_id = oi.order_id
     SET oi.numeric_order_id = m.new_id`
  );

  const [[unmappedOrders]] = await connection.execute(
    'SELECT COUNT(*) AS count FROM orders WHERE numeric_order_id IS NULL'
  );
  const [[unmappedItems]] = await connection.execute(
    'SELECT COUNT(*) AS count FROM order_items WHERE numeric_order_id IS NULL'
  );
  if (Number(unmappedOrders.count) > 0 || Number(unmappedItems.count) > 0) {
    throw new Error('Cannot migrate orders.id because some order records could not be mapped');
  }

  if (orderItemsReference) {
    const constraintName = orderItemsReference.CONSTRAINT_NAME.replace(/`/g, '``');
    await connection.execute(
      `ALTER TABLE order_items DROP FOREIGN KEY \`${constraintName}\``
    );
  }
  const [orderItemIndexes] = await connection.execute(
    `SELECT DISTINCT INDEX_NAME
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'order_items'
       AND COLUMN_NAME = 'order_id'
       AND INDEX_NAME <> 'PRIMARY'`
  );
  for (const index of orderItemIndexes) {
    const indexName = index.INDEX_NAME.replace(/`/g, '``');
    await connection.execute(`ALTER TABLE order_items DROP INDEX \`${indexName}\``);
  }
  await connection.execute(`
    ALTER TABLE order_items
      DROP COLUMN order_id,
      CHANGE COLUMN numeric_order_id order_id INT NOT NULL,
      ADD INDEX idx_order_items_order (order_id)
  `);
  await connection.execute(`
    ALTER TABLE orders
      DROP PRIMARY KEY,
      DROP COLUMN id,
      CHANGE COLUMN numeric_order_id id INT NOT NULL AUTO_INCREMENT,
      ADD PRIMARY KEY (id)
  `);

  const constraintName = orderItemsReference
    ? orderItemsReference.CONSTRAINT_NAME.replace(/`/g, '``')
    : 'fk_order_items_order';
  await connection.execute(
    `ALTER TABLE order_items
     ADD CONSTRAINT \`${constraintName}\`
     FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`
  );
  await connection.execute('DROP TEMPORARY TABLE order_id_map');
  console.log('Migrated orders.id to sequential numeric IDs');
}

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
        rating DECIMAL(2,1) NOT NULL DEFAULT 0,
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

    const [productRatingColumns] = await connection.execute(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'rating'`
    );
    if (productRatingColumns.length === 0) {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN rating DECIMAL(2,1) NOT NULL DEFAULT 0 AFTER discount'
      );
    }

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        product_name VARCHAR(255),
        product_image TEXT,
        price DECIMAL(12,2),
        offer_price DECIMAL(12,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_product (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);
    const cartSnapshotColumns = [
      ['product_name', 'VARCHAR(255) NULL'],
      ['product_image', 'TEXT NULL'],
      ['price', 'DECIMAL(12,2) NULL'],
      ['offer_price', 'DECIMAL(12,2) NULL']
    ];
    for (const [columnName, columnDefinition] of cartSnapshotColumns) {
      const [columns] = await connection.execute(
        `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cart_items' AND COLUMN_NAME = ?`,
        [columnName]
      );
      if (columns.length === 0) {
        await connection.execute(
          `ALTER TABLE cart_items ADD COLUMN ${columnName} ${columnDefinition}`
        );
      }
    }
    const [cartRowsToBackfill] = await connection.execute(
      `SELECT c.id, p.name, p.images, p.price, p.offer_price
       FROM cart_items c
       JOIN products p ON p.product_id = c.product_id
       WHERE c.product_name IS NULL OR c.product_image IS NULL
          OR c.price IS NULL OR c.offer_price IS NULL`
    );
    for (const cartRow of cartRowsToBackfill) {
      let productImage = null;
      try {
        const images = cartRow.images ? JSON.parse(cartRow.images) : [];
        productImage = Array.isArray(images) ? images[0] || null : null;
      } catch (error) {
        console.error(`Could not backfill cart image for item ${cartRow.id}:`, error);
      }
      await connection.execute(
        `UPDATE cart_items
         SET product_name = COALESCE(product_name, ?),
             product_image = COALESCE(product_image, ?),
             price = COALESCE(price, ?),
             offer_price = COALESCE(offer_price, ?)
         WHERE id = ?`,
        [cartRow.name, productImage, cartRow.price, cartRow.offer_price, cartRow.id]
      );
    }
    console.log('Cart items table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS customer_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(254) NOT NULL,
        address_line1 VARCHAR(150) NOT NULL,
        address_line2 VARCHAR(150),
        pincode VARCHAR(10) NOT NULL,
        city VARCHAR(80) NOT NULL,
        state VARCHAR(80) NOT NULL,
        is_default TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_addresses_user (user_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('Customer addresses table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(40) UNIQUE NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'Pending',
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(254) NOT NULL,
        address_line1 VARCHAR(150) NOT NULL,
        address_line2 VARCHAR(150),
        pincode VARCHAR(10) NOT NULL,
        city VARCHAR(80) NOT NULL,
        state VARCHAR(80) NOT NULL,
        delivery_option ENUM('standard', 'express') NOT NULL DEFAULT 'standard',
        payment_method ENUM('contact', 'cod') NOT NULL DEFAULT 'contact',
        subtotal DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_orders_user_created (user_id, created_at),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('Orders table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id VARCHAR(100),
        product_name VARCHAR(255) NOT NULL,
        product_image TEXT,
        quantity INT NOT NULL,
        unit_price DECIMAL(12,2) NOT NULL,
        line_total DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_order_items_order (order_id),
        CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
      )
    `);
    await migrateOrderIdsToAutoIncrement(connection);
    const [orderImageColumn] = await connection.execute(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_items' AND COLUMN_NAME = 'product_image'`
    );
    if (orderImageColumn.length === 0) {
      await connection.execute('ALTER TABLE order_items ADD COLUMN product_image TEXT NULL');
    }
    const [orderRowsToBackfill] = await connection.execute(
      `SELECT oi.id, p.images
       FROM order_items oi
       JOIN products p ON p.product_id = oi.product_id
       WHERE oi.product_image IS NULL`
    );
    for (const orderRow of orderRowsToBackfill) {
      let productImage = null;
      try {
        const images = orderRow.images ? JSON.parse(orderRow.images) : [];
        productImage = Array.isArray(images) ? images[0] || null : null;
      } catch (error) {
        console.error(`Could not backfill order item image for item ${orderRow.id}:`, error);
      }
      await connection.execute(
        'UPDATE order_items SET product_image = ? WHERE id = ?',
        [productImage, orderRow.id]
      );
    }
    console.log('Order items table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS banners (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT,
        image TEXT NOT NULL,
        mobile_image TEXT,
        link TEXT,
        type ENUM('hero', 'offer') DEFAULT 'hero',
        active TINYINT(1) DEFAULT 1,
        user_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Banners table initialized');

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
      CREATE TABLE IF NOT EXISTS dealers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dealer_id VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        contact_person VARCHAR(255),
        mobile_number VARCHAR(20),
        alternate_mobile_number VARCHAR(20),
        email_address VARCHAR(255),
        gst_number VARCHAR(50),
        pan_number VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        pincode VARCHAR(20),
        business_type VARCHAR(100),
        bank_name VARCHAR(255),
        account_number VARCHAR(100),
        ifsc_code VARCHAR(50),
        opening_balance DECIMAL(12,2) DEFAULT 0,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        notes TEXT,
        profile_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Dealers table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dealer_purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dealer_id VARCHAR(100) NOT NULL,
        invoice_number VARCHAR(100) NOT NULL,
        purchase_date DATE,
        product_details TEXT,
        gold_purity VARCHAR(100),
        weight DECIMAL(10,3),
        gold_rate DECIMAL(12,2),
        making_charges DECIMAL(12,2),
        total_amount DECIMAL(12,2),
        payment_status ENUM('Paid', 'Pending', 'Partially Paid') DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (dealer_id) REFERENCES dealers(dealer_id)
      )
    `);
    console.log('Dealer purchases table initialized');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dealer_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dealer_id VARCHAR(100) NOT NULL,
        payment_date DATE,
        payment_mode VARCHAR(50) DEFAULT 'Cash',
        reference_number VARCHAR(100),
        amount DECIMAL(12,2),
        remarks TEXT,
        receipt_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (dealer_id) REFERENCES dealers(dealer_id)
      )
    `);
    console.log('Dealer payments table initialized');

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
