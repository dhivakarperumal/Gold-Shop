const { pool } = require('../config/db');

async function getPayments(req, res) {
  try {
    const { customerId, loanId } = req.query;
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT * FROM payments WHERE 1=1';
      const params = [];

      if (customerId) {
        query += ' AND customer_id = ?';
        params.push(customerId);
      }
      if (loanId) {
        query += ' AND loan_id = ?';
        params.push(loanId);
      }

      query += ' ORDER BY created_at DESC';
      const [rows] = await connection.execute(query, params);

      const payments = rows.map(row => ({
        id: row.id,
        customerId: row.customer_id,
        customerName: row.customer_name,
        loanId: row.loan_id,
        amount: row.amount,
        type: row.type,
        date: row.date,
        isThirdParty: Boolean(row.is_third_party),
        payerName: row.payer_name,
        payerRelation: row.payer_relation,
        balance: row.balance,
        releasedTo: row.released_to,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.status(200).json(payments);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
}

async function createPayment(req, res) {
  try {
    const {
      customerId, customerName, loanId, amount, type,
      date, isThirdParty, payerName, payerRelation, balance, releasedTo
    } = req.body;

    if (!customerId || !loanId || amount === undefined || amount === null) {
      return res.status(400).json({ message: 'customerId, loanId, and amount are required' });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO payments
          (customer_id, customer_name, loan_id, amount, type,
           date, is_third_party, payer_name, payer_relation,
           balance, released_to, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          customerId,
          customerName || '',
          loanId,
          amount,
          type || 'Settlement',
          date || new Date().toISOString(),
          isThirdParty ? 1 : 0,
          payerName || null,
          payerRelation || null,
          balance != null ? balance : 0,
          releasedTo || null
        ]
      );

      res.status(201).json({
        message: 'Payment recorded successfully',
        id: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Failed to record payment', error: error.message });
  }
}

module.exports = {
  getPayments,
  createPayment
};
