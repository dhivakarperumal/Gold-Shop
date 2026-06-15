const { pool } = require('../config/db');

async function createDealerPayment(req, res) {
  try {
    const {
      dealerId,
      paymentDate,
      paymentMode,
      referenceNumber,
      amount,
      remarks,
      receiptUrl
    } = req.body;

    if (!dealerId || !paymentDate || typeof amount === 'undefined') {
      return res.status(400).json({ message: 'dealerId, paymentDate, and amount are required' });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO dealer_payments
          (dealer_id, payment_date, payment_mode, reference_number, amount, remarks,
           receipt_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          dealerId,
          paymentDate,
          paymentMode || 'Cash',
          referenceNumber || null,
          amount,
          remarks || null,
          receiptUrl || null
        ]
      );

      res.status(201).json({ message: 'Dealer payment created successfully', id: result.insertId });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create dealer payment error:', error);
    res.status(500).json({ message: 'Failed to create dealer payment', error: error.message });
  }
}

async function getAllDealerPayments(req, res) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM dealer_payments ORDER BY payment_date DESC'
      );
      res.status(200).json(rows);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get dealer payments error:', error);
    res.status(500).json({ message: 'Failed to fetch dealer payments', error: error.message });
  }
}

module.exports = {
  createDealerPayment,
  getAllDealerPayments
};
