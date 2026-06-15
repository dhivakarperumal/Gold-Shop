const { pool } = require('../config/db');

async function createDealer(req, res) {
  try {
    const {
      dealerId,
      name,
      companyName,
      contactPerson,
      mobileNumber,
      alternateMobileNumber,
      emailAddress,
      gstNumber,
      panNumber,
      address,
      city,
      state,
      pincode,
      businessType,
      bankName,
      accountNumber,
      ifscCode,
      openingBalance,
      status,
      notes,
      profileImageUrl
    } = req.body;

    if (!name || !mobileNumber) {
      return res.status(400).json({ message: 'name and mobileNumber are required' });
    }

    const connection = await pool.getConnection();
    try {
      const newDealerId = dealerId || `DLR-${Date.now()}`;

      const [existing] = await connection.execute(
        'SELECT id FROM dealers WHERE dealer_id = ?',
        [newDealerId]
      );

      if (existing.length > 0) {
        return res.status(409).json({ message: 'Dealer already exists' });
      }

      const [result] = await connection.execute(
        `INSERT INTO dealers
          (dealer_id, name, company_name, contact_person, mobile_number,
           alternate_mobile_number, email_address, gst_number, pan_number,
           address, city, state, pincode, business_type, bank_name,
           account_number, ifsc_code, opening_balance, status, notes,
           profile_image_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          newDealerId,
          name,
          companyName || null,
          contactPerson || null,
          mobileNumber,
          alternateMobileNumber || null,
          emailAddress || null,
          gstNumber || null,
          panNumber || null,
          address || null,
          city || null,
          state || null,
          pincode || null,
          businessType || null,
          bankName || null,
          accountNumber || null,
          ifscCode || null,
          openingBalance || 0,
          status || 'Active',
          notes || null,
          profileImageUrl || null
        ]
      );

      res.status(201).json({
        message: 'Dealer created successfully',
        id: result.insertId,
        dealerId: newDealerId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Dealer creation error:', error);
    res.status(500).json({ message: 'Failed to create dealer', error: error.message });
  }
}

async function getDealers(req, res) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM dealers ORDER BY created_at DESC'
      );

      const dealers = rows.map((row) => ({
        id: row.id,
        dealerId: row.dealer_id,
        name: row.name,
        companyName: row.company_name,
        contactPerson: row.contact_person,
        mobileNumber: row.mobile_number,
        alternateMobileNumber: row.alternate_mobile_number,
        emailAddress: row.email_address,
        gstNumber: row.gst_number,
        panNumber: row.pan_number,
        address: row.address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        businessType: row.business_type,
        bankName: row.bank_name,
        accountNumber: row.account_number,
        ifscCode: row.ifsc_code,
        openingBalance: row.opening_balance,
        status: row.status,
        notes: row.notes,
        profileImageUrl: row.profile_image_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.status(200).json(dealers);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get dealers error:', error);
    res.status(500).json({ message: 'Failed to fetch dealers', error: error.message });
  }
}

async function getDealerById(req, res) {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM dealers WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      const row = rows[0];
      const dealer = {
        id: row.id,
        dealerId: row.dealer_id,
        name: row.name,
        companyName: row.company_name,
        contactPerson: row.contact_person,
        mobileNumber: row.mobile_number,
        alternateMobileNumber: row.alternate_mobile_number,
        emailAddress: row.email_address,
        gstNumber: row.gst_number,
        panNumber: row.pan_number,
        address: row.address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        businessType: row.business_type,
        bankName: row.bank_name,
        accountNumber: row.account_number,
        ifscCode: row.ifsc_code,
        openingBalance: row.opening_balance,
        status: row.status,
        notes: row.notes,
        profileImageUrl: row.profile_image_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.status(200).json(dealer);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get dealer error:', error);
    res.status(500).json({ message: 'Failed to fetch dealer', error: error.message });
  }
}

async function updateDealer(req, res) {
  try {
    const { id } = req.params;
    const {
      dealerId,
      name,
      companyName,
      contactPerson,
      mobileNumber,
      alternateMobileNumber,
      emailAddress,
      gstNumber,
      panNumber,
      address,
      city,
      state,
      pincode,
      businessType,
      bankName,
      accountNumber,
      ifscCode,
      openingBalance,
      status,
      notes,
      profileImageUrl
    } = req.body;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `UPDATE dealers SET
           dealer_id = ?, name = ?, company_name = ?, contact_person = ?, mobile_number = ?,
           alternate_mobile_number = ?, email_address = ?, gst_number = ?, pan_number = ?,
           address = ?, city = ?, state = ?, pincode = ?, business_type = ?, bank_name = ?,
           account_number = ?, ifsc_code = ?, opening_balance = ?, status = ?, notes = ?,
           profile_image_url = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          dealerId || null,
          name || null,
          companyName || null,
          contactPerson || null,
          mobileNumber || null,
          alternateMobileNumber || null,
          emailAddress || null,
          gstNumber || null,
          panNumber || null,
          address || null,
          city || null,
          state || null,
          pincode || null,
          businessType || null,
          bankName || null,
          accountNumber || null,
          ifscCode || null,
          openingBalance || 0,
          status || 'Active',
          notes || null,
          profileImageUrl || null,
          id
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      res.status(200).json({ message: 'Dealer updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update dealer error:', error);
    res.status(500).json({ message: 'Failed to update dealer', error: error.message });
  }
}

async function deleteDealer(req, res) {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM dealers WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Dealer not found' });
      }

      res.status(200).json({ message: 'Dealer deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete dealer error:', error);
    res.status(500).json({ message: 'Failed to delete dealer', error: error.message });
  }
}

async function getDealerPurchases(req, res) {
  try {
    const { dealerId } = req.params;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM dealer_purchases WHERE dealer_id = ? ORDER BY purchase_date DESC',
        [dealerId]
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

async function getDealerPayments(req, res) {
  try {
    const { dealerId } = req.params;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM dealer_payments WHERE dealer_id = ? ORDER BY payment_date DESC',
        [dealerId]
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
  createDealer,
  getDealers,
  getDealerById,
  updateDealer,
  deleteDealer,
  getDealerPurchases,
  getDealerPayments
};
