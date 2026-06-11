const { pool } = require('../config/db');

async function createLoan(req, res) {
  try {
    const {
      customerId, customerName, customerMobile, goldItems, loanAmount,
      interestRate, interestType, duration, processingFee, valuationCharges,
      gst, loanDate, dueDate, status
    } = req.body;

    if (!customerId || !loanAmount || !goldItems) {
      return res.status(400).json({ message: 'customerId, loanAmount, and goldItems are required' });
    }

    const connection = await pool.getConnection();
    try {
      const [customerExists] = await connection.execute(
        'SELECT customer_id FROM customers WHERE customer_id = ?',
        [customerId]
      );

      if (customerExists.length === 0) {
        return res.status(400).json({ message: 'Customer not found for provided customerId' });
      }

      const [result] = await connection.execute(
        `INSERT INTO loans
          (customer_id, customer_name, customer_mobile, gold_items, loan_amount,
           interest_rate, interest_type, duration, processing_fee, valuation_charges,
           gst, loan_date, due_date, balance_amount, paid_amount, interest_paid,
           status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          customerId, customerName || '', customerMobile || '',
          JSON.stringify(goldItems), loanAmount,
          interestRate || 0, interestType || 'Simple', duration || 12,
          processingFee || 0, valuationCharges || 0, gst || 0,
          loanDate || new Date().toISOString().split('T')[0],
          dueDate || new Date().toISOString().split('T')[0],
          loanAmount, 0, 0,
          status || 'Active'
        ]
      );

      res.status(201).json({
        message: 'Loan created successfully',
        id: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Loan creation error:', error);
    res.status(500).json({ message: 'Failed to create loan', error: error.message });
  }
}

async function getLoans(req, res) {
  try {
    const { customerId, status } = req.query;
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT * FROM loans WHERE 1=1';
      const params = [];

      if (customerId) {
        query += ' AND customer_id = ?';
        params.push(customerId);
      }
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';
      const [rows] = await connection.execute(query, params);

      const loans = rows.map(row => ({
        id: row.id,
        customerId: row.customer_id,
        customerName: row.customer_name,
        customerMobile: row.customer_mobile,
        goldItems: row.gold_items ? JSON.parse(row.gold_items) : [],
        loanAmount: row.loan_amount,
        interestRate: row.interest_rate,
        interestType: row.interest_type,
        duration: row.duration,
        processingFee: row.processing_fee,
        valuationCharges: row.valuation_charges,
        gst: row.gst,
        loanDate: row.loan_date,
        dueDate: row.due_date,
        balanceAmount: row.balance_amount,
        paidAmount: row.paid_amount,
        interestPaid: row.interest_paid,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.status(200).json(loans);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ message: 'Failed to fetch loans', error: error.message });
  }
}

async function getLoanById(req, res) {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM loans WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Loan not found' });
      }

      const row = rows[0];
      const loan = {
        id: row.id,
        customerId: row.customer_id,
        customerName: row.customer_name,
        customerMobile: row.customer_mobile,
        goldItems: row.gold_items ? JSON.parse(row.gold_items) : [],
        loanAmount: row.loan_amount,
        interestRate: row.interest_rate,
        interestType: row.interest_type,
        duration: row.duration,
        processingFee: row.processing_fee,
        valuationCharges: row.valuation_charges,
        gst: row.gst,
        loanDate: row.loan_date,
        dueDate: row.due_date,
        balanceAmount: row.balance_amount,
        paidAmount: row.paid_amount,
        interestPaid: row.interest_paid,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.status(200).json(loan);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ message: 'Failed to fetch loan', error: error.message });
  }
}

async function updateLoan(req, res) {
  try {
    const { id } = req.params;
    const {
      customerName, customerMobile, goldItems, loanAmount, interestRate,
      interestType, duration, processingFee, valuationCharges, gst,
      loanDate, dueDate, balanceAmount, paidAmount, interestPaid, status
    } = req.body;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `UPDATE loans SET
          customer_name = ?, customer_mobile = ?, gold_items = ?, loan_amount = ?,
          interest_rate = ?, interest_type = ?, duration = ?, processing_fee = ?,
          valuation_charges = ?, gst = ?, loan_date = ?, due_date = ?,
          balance_amount = ?, paid_amount = ?, interest_paid = ?, status = ?,
          updated_at = NOW()
          WHERE id = ?`,
        [
          customerName || '', customerMobile || '',
          goldItems ? JSON.stringify(goldItems) : '[]',
          loanAmount || 0, interestRate || 0, interestType || 'Simple',
          duration || 12, processingFee || 0, valuationCharges || 0,
          gst || 0, loanDate, dueDate, balanceAmount || 0,
          paidAmount || 0, interestPaid || 0, status || 'Active', id
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Loan not found' });
      }

      res.status(200).json({ message: 'Loan updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({ message: 'Failed to update loan', error: error.message });
  }
}

async function deleteLoan(req, res) {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM loans WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Loan not found' });
      }

      res.status(200).json({ message: 'Loan deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({ message: 'Failed to delete loan', error: error.message });
  }
}

module.exports = {
  createLoan,
  getLoans,
  getLoanById,
  updateLoan,
  deleteLoan
};
