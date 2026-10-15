const { pool } = require('../config/db');

const ADDRESS_FIELDS = [
  'fullName',
  'phone',
  'email',
  'addressLine1',
  'addressLine2',
  'pincode',
  'city',
  'state'
];

function validateAddress(body) {
  const requiredFields = ['fullName', 'phone', 'email', 'addressLine1', 'pincode', 'city', 'state'];
  for (const field of requiredFields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      return `${field} is required`;
    }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
    return 'email must be valid';
  }

  const maxLengths = {
    fullName: 100,
    phone: 20,
    email: 254,
    addressLine1: 150,
    addressLine2: 150,
    pincode: 10,
    city: 80,
    state: 80
  };
  for (const field of ADDRESS_FIELDS) {
    const value = body[field];
    if (value != null && (typeof value !== 'string' || value.length > maxLengths[field])) {
      return `${field} must be a string no longer than ${maxLengths[field]} characters`;
    }
  }
  return null;
}

function mapAddress(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2 || '',
    pincode: row.pincode,
    city: row.city,
    state: row.state,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getAddresses(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [req.user.user_id]
    );
    return res.json({ addresses: rows.map(mapAddress) });
  } catch (error) {
    console.error('Get addresses error:', error);
    return res.status(500).json({ message: 'Failed to load addresses' });
  }
}

async function createAddress(req, res) {
  const validationError = validateAddress(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const address = req.body;
  const isDefault = address.isDefault === true;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    if (isDefault) {
      await connection.execute(
        'UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?',
        [req.user.user_id]
      );
    }
    const [result] = await connection.execute(
      `INSERT INTO customer_addresses
        (user_id, full_name, phone, email, address_line1, address_line2,
         pincode, city, state, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.user_id,
        address.fullName.trim(),
        address.phone.trim(),
        address.email.trim(),
        address.addressLine1.trim(),
        address.addressLine2 ? address.addressLine2.trim() : null,
        address.pincode.trim(),
        address.city.trim(),
        address.state.trim(),
        isDefault ? 1 : 0
      ]
    );
    await connection.commit();

    const [rows] = await pool.execute(
      'SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?',
      [result.insertId, req.user.user_id]
    );
    return res.status(201).json({ message: 'Address saved', address: mapAddress(rows[0]) });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Create address error:', error);
    return res.status(500).json({ message: 'Failed to save address' });
  } finally {
    if (connection) connection.release();
  }
}

async function updateAddress(req, res) {
  const validationError = validateAddress(req.body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  const addressId = Number(req.params.id);
  if (!Number.isSafeInteger(addressId) || addressId < 1) {
    return res.status(400).json({ message: 'Invalid address id' });
  }

  const address = req.body;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [existing] = await connection.execute(
      'SELECT id FROM customer_addresses WHERE id = ? AND user_id = ? FOR UPDATE',
      [addressId, req.user.user_id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Address not found' });
    }

    const isDefault = address.isDefault === true;
    if (isDefault) {
      await connection.execute(
        'UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?',
        [req.user.user_id]
      );
    }
    await connection.execute(
      `UPDATE customer_addresses SET
        full_name = ?, phone = ?, email = ?, address_line1 = ?, address_line2 = ?,
        pincode = ?, city = ?, state = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        address.fullName.trim(),
        address.phone.trim(),
        address.email.trim(),
        address.addressLine1.trim(),
        address.addressLine2 ? address.addressLine2.trim() : null,
        address.pincode.trim(),
        address.city.trim(),
        address.state.trim(),
        isDefault ? 1 : 0,
        addressId,
        req.user.user_id
      ]
    );
    await connection.commit();

    const [rows] = await pool.execute(
      'SELECT * FROM customer_addresses WHERE id = ? AND user_id = ?',
      [addressId, req.user.user_id]
    );
    return res.json({ message: 'Address updated', address: mapAddress(rows[0]) });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Update address error:', error);
    return res.status(500).json({ message: 'Failed to update address' });
  } finally {
    if (connection) connection.release();
  }
}

async function deleteAddress(req, res) {
  const addressId = Number(req.params.id);
  if (!Number.isSafeInteger(addressId) || addressId < 1) {
    return res.status(400).json({ message: 'Invalid address id' });
  }
  try {
    const [result] = await pool.execute(
      'DELETE FROM customer_addresses WHERE id = ? AND user_id = ?',
      [addressId, req.user.user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }
    return res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({ message: 'Failed to delete address' });
  }
}

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
