const { pool } = require('../config/db');

async function createCustomer(req, res) {
  try {
    const {
      customerId, name, mobile, altPhone, email, aadharNo, panNo, voterId,
      kycStatus, permanentAddress, currentAddress, city, state, pincode,
      landmark, occupation, companyName, monthlyIncome, businessType,
      bankAccountNo, ifscCode, fatherSpouseName, nomineeName, nomineeRelation,
      emergencyContactNo, referenceName, referenceMobile, customerPhoto,
      aadharFront, aadharBack, panPhoto, amountActive
    } = req.body;

    if (!customerId || !name || !mobile) {
      return res.status(400).json({ message: 'customerId, name, and mobile are required' });
    }

    const connection = await pool.getConnection();
    try {
      // Check if customer exists
      const [existing] = await connection.execute(
        'SELECT id FROM customers WHERE customer_id = ?',
        [customerId]
      );

      if (existing.length > 0) {
        return res.status(409).json({ message: 'Customer already exists' });
      }

      const [result] = await connection.execute(
        `INSERT INTO customers
          (customer_id, name, mobile, alt_phone, email, aadhar_no, pan_no,
           voter_id, kyc_status, permanent_address, current_address, city,
           state, pincode, landmark, occupation, company_name, monthly_income,
           business_type, bank_account_no, ifsc_code, father_spouse_name,
           nominee_name, nominee_relation, emergency_contact_no, reference_name,
           reference_mobile, customer_photo, aadhar_front, aadhar_back, pan_photo,
           amount_active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          customerId, name, mobile, altPhone || null, email || null,
          aadharNo || null, panNo || null, voterId || null, kycStatus || 'Pending',
          permanentAddress || null, currentAddress || null, city || null,
          state || null, pincode || null, landmark || null, occupation || null,
          companyName || null, monthlyIncome || 0, businessType || null,
          bankAccountNo || null, ifscCode || null, fatherSpouseName || null,
          nomineeName || null, nomineeRelation || null, emergencyContactNo || null,
          referenceName || null, referenceMobile || null, customerPhoto || null,
          aadharFront || null, aadharBack || null, panPhoto || null,
          amountActive || 0
        ]
      );

      res.status(201).json({
        message: 'Customer created successfully',
        id: result.insertId,
        customerId: customerId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({ message: 'Failed to create customer', error: error.message });
  }
}

async function getCustomers(req, res) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM customers ORDER BY created_at DESC'
      );

      const customers = rows.map(row => ({
        id: row.id,
        customerId: row.customer_id,
        name: row.name,
        mobile: row.mobile,
        altPhone: row.alt_phone,
        email: row.email,
        aadharNo: row.aadhar_no,
        panNo: row.pan_no,
        voterId: row.voter_id,
        kycStatus: row.kyc_status,
        permanentAddress: row.permanent_address,
        currentAddress: row.current_address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        landmark: row.landmark,
        occupation: row.occupation,
        companyName: row.company_name,
        monthlyIncome: row.monthly_income,
        businessType: row.business_type,
        bankAccountNo: row.bank_account_no,
        ifscCode: row.ifsc_code,
        fatherSpouseName: row.father_spouse_name,
        nomineeName: row.nominee_name,
        nomineeRelation: row.nominee_relation,
        emergencyContactNo: row.emergency_contact_no,
        referenceName: row.reference_name,
        referenceMobile: row.reference_mobile,
        customerPhoto: row.customer_photo,
        aadharFront: row.aadhar_front,
        aadharBack: row.aadhar_back,
        panPhoto: row.pan_photo,
        amountActive: row.amount_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      res.status(200).json(customers);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
}

async function getCustomerById(req, res) {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM customers WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      const row = rows[0];
      const customer = {
        id: row.id,
        customerId: row.customer_id,
        name: row.name,
        mobile: row.mobile,
        altPhone: row.alt_phone,
        email: row.email,
        aadharNo: row.aadhar_no,
        panNo: row.pan_no,
        voterId: row.voter_id,
        kycStatus: row.kyc_status,
        permanentAddress: row.permanent_address,
        currentAddress: row.current_address,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        landmark: row.landmark,
        occupation: row.occupation,
        companyName: row.company_name,
        monthlyIncome: row.monthly_income,
        businessType: row.business_type,
        bankAccountNo: row.bank_account_no,
        ifscCode: row.ifsc_code,
        fatherSpouseName: row.father_spouse_name,
        nomineeName: row.nominee_name,
        nomineeRelation: row.nominee_relation,
        emergencyContactNo: row.emergency_contact_no,
        referenceName: row.reference_name,
        referenceMobile: row.reference_mobile,
        customerPhoto: row.customer_photo,
        aadharFront: row.aadhar_front,
        aadharBack: row.aadhar_back,
        panPhoto: row.pan_photo,
        amountActive: row.amount_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      res.status(200).json(customer);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Failed to fetch customer', error: error.message });
  }
}

async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const {
      customerId, name, mobile, altPhone, email, aadharNo, panNo, voterId,
      kycStatus, permanentAddress, currentAddress, city, state, pincode,
      landmark, occupation, companyName, monthlyIncome, businessType,
      bankAccountNo, ifscCode, fatherSpouseName, nomineeName, nomineeRelation,
      emergencyContactNo, referenceName, referenceMobile, customerPhoto,
      aadharFront, aadharBack, panPhoto, amountActive
    } = req.body;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `UPDATE customers SET
          customer_id = ?, name = ?, mobile = ?, alt_phone = ?, email = ?,
          aadhar_no = ?, pan_no = ?, voter_id = ?, kyc_status = ?,
          permanent_address = ?, current_address = ?, city = ?, state = ?,
          pincode = ?, landmark = ?, occupation = ?, company_name = ?,
          monthly_income = ?, business_type = ?, bank_account_no = ?,
          ifsc_code = ?, father_spouse_name = ?, nominee_name = ?,
          nominee_relation = ?, emergency_contact_no = ?, reference_name = ?,
          reference_mobile = ?, customer_photo = ?, aadhar_front = ?,
          aadhar_back = ?, pan_photo = ?, amount_active = ?, updated_at = NOW()
          WHERE id = ?`,
        [
          customerId, name, mobile, altPhone || null, email || null,
          aadharNo || null, panNo || null, voterId || null, kycStatus || 'Pending',
          permanentAddress || null, currentAddress || null, city || null,
          state || null, pincode || null, landmark || null, occupation || null,
          companyName || null, monthlyIncome || 0, businessType || null,
          bankAccountNo || null, ifscCode || null, fatherSpouseName || null,
          nomineeName || null, nomineeRelation || null, emergencyContactNo || null,
          referenceName || null, referenceMobile || null, customerPhoto || null,
          aadharFront || null, aadharBack || null, panPhoto || null,
          amountActive || 0, id
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.status(200).json({ message: 'Customer updated successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ message: 'Failed to update customer', error: error.message });
  }
}

async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM customers WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.status(200).json({ message: 'Customer deleted successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Failed to delete customer', error: error.message });
  }
}

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
