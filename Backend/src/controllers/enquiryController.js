const { pool } = require('../config/db');

const ENQUIRY_STATUSES = ['New', 'In Progress', 'Resolved', 'Closed'];

function mapEnquiry(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    subject: row.subject,
    message: row.message,
    status: row.status,
    assignedTo: row.assigned_to || '',
    internalNotes: row.internal_notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required' });
  }
  return next();
}

async function submitEnquiry(req, res) {
  const { name, email, phone, subject, message } = req.body;
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
    return res.status(400).json({ message: 'Name is required and must be 100 characters or fewer' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }
  if (phone != null && (typeof phone !== 'string' || phone.trim().length > 30)) {
    return res.status(400).json({ message: 'Phone must be 30 characters or fewer' });
  }
  if (typeof subject !== 'string' || !subject.trim() || subject.trim().length > 100) {
    return res.status(400).json({ message: 'Please select a valid enquiry topic' });
  }
  if (typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 2000) {
    return res.status(400).json({ message: 'Message must be between 5 and 2000 characters' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO enquiries (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), phone?.trim() || null, subject.trim(), message.trim()]
    );
    return res.status(201).json({
      message: 'Your enquiry has been submitted. Our team will be in touch soon.',
      id: result.insertId
    });
  } catch (error) {
    console.error('Enquiry submission error:', error);
    return res.status(500).json({ message: 'Could not submit your enquiry. Please try again.' });
  }
}

async function getEnquiries(req, res) {
  try {
    const [rows] = await pool.execute('SELECT * FROM enquiries ORDER BY created_at DESC');
    return res.json({ enquiries: rows.map(mapEnquiry) });
  } catch (error) {
    console.error('Get enquiries error:', error);
    return res.status(500).json({ message: 'Failed to load enquiries' });
  }
}

async function updateEnquiry(req, res) {
  const { status, assignedTo, internalNotes } = req.body;
  if (status !== undefined && !ENQUIRY_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid enquiry status' });
  }
  if (assignedTo !== undefined && (typeof assignedTo !== 'string' || assignedTo.length > 100)) {
    return res.status(400).json({ message: 'Assignee must be 100 characters or fewer' });
  }
  if (internalNotes !== undefined && (typeof internalNotes !== 'string' || internalNotes.length > 4000)) {
    return res.status(400).json({ message: 'Internal notes must be 4000 characters or fewer' });
  }
  if (status === undefined && assignedTo === undefined && internalNotes === undefined) {
    return res.status(400).json({ message: 'No enquiry updates were provided' });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE enquiries
       SET status = COALESCE(?, status),
           assigned_to = COALESCE(?, assigned_to),
           internal_notes = COALESCE(?, internal_notes)
       WHERE id = ?`,
      [status ?? null, assignedTo === undefined ? null : assignedTo.trim(), internalNotes ?? null, req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    const [rows] = await pool.execute('SELECT * FROM enquiries WHERE id = ?', [req.params.id]);
    return res.json({ enquiry: mapEnquiry(rows[0]) });
  } catch (error) {
    console.error('Update enquiry error:', error);
    return res.status(500).json({ message: 'Failed to update enquiry' });
  }
}

async function deleteEnquiry(req, res) {
  try {
    const [result] = await pool.execute('DELETE FROM enquiries WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Enquiry not found' });
    }
    return res.json({ message: 'Enquiry deleted' });
  } catch (error) {
    console.error('Delete enquiry error:', error);
    return res.status(500).json({ message: 'Failed to delete enquiry' });
  }
}

module.exports = {
  submitEnquiry,
  getEnquiries,
  updateEnquiry,
  deleteEnquiry,
  requireAdmin
};
