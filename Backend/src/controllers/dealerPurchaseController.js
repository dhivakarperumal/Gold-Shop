const { pool } = require('../config/db');

async function createDealerPurchase(req, res) {
  try {
    const {
      dealerId,
      invoiceNumber,
      purchaseDate,
      productDetails,
      goldPurity,
      weight,
      goldRate,
      makingCharges,
      totalAmount,
      paymentStatus,
      notes
    } = req.body;

    if (!dealerId || !invoiceNumber || !purchaseDate) {
      return res.status(400).json({ message: 'dealerId, invoiceNumber, and purchaseDate are required' });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO dealer_purchases
          (dealer_id, invoice_number, purchase_date, product_details, gold_purity,
           weight, gold_rate, making_charges, total_amount, payment_status, notes,
           created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          dealerId,
          invoiceNumber,
          purchaseDate,
          productDetails || null,
          goldPurity || null,
          weight || 0,
          goldRate || 0,
          makingCharges || 0,
          totalAmount || 0,
          paymentStatus || 'Pending',
          notes || null
        ]
      );

      res.status(201).json({ message: 'Dealer purchase created successfully', id: result.insertId });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create dealer purchase error:', error);
    res.status(500).json({ message: 'Failed to create dealer purchase', error: error.message });
  }
}

async function getAllDealerPurchases(req, res) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM dealer_purchases ORDER BY purchase_date DESC'
      );
      res.status(200).json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get dealer purchases error:', error);
    res.status(500).json({ message: 'Failed to fetch dealer purchases', error: error.message });
  }
}

module.exports = {
  createDealerPurchase,
  getAllDealerPurchases
};
