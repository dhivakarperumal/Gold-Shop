const path = require('path');
const { pool } = require('../config/db');

function serializeBanner(row) {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    image: row.image,
    mobile_image: row.mobile_image,
    link: row.link,
    type: row.type,
    active: Boolean(row.active),
    user_id: row.user_id,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

async function getBanners(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, title, subtitle, description, image, mobile_image, link, type, active, user_id, created_at, updated_at FROM banners ORDER BY created_at DESC'
    );
    res.json({ data: rows.map(serializeBanner) });
  } catch (error) {
    console.error('Banner list error:', error);
    res.status(500).json({ message: 'Failed to load banners' });
  }
}

async function createBanner(req, res) {
  const {
    title,
    subtitle,
    description,
    image,
    mobile_image,
    link,
    type,
    active,
    user_id
  } = req.body;

  if (typeof title !== 'string' || !title.trim() || typeof image !== 'string' || !image.trim()) {
    return res.status(400).json({ message: 'Banner title and desktop image are required' });
  }
  if (type && !['hero', 'offer'].includes(type)) {
    return res.status(400).json({ message: 'Banner type must be hero or offer' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO banners (title, subtitle, description, image, mobile_image, link, type, active, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        subtitle || null,
        description || null,
        image.trim(),
        mobile_image || null,
        link || null,
        type || 'hero',
        active === false || active === 0 || active === 'false' ? 0 : 1,
        user_id || null
      ]
    );
    const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Banner created', data: serializeBanner(rows[0]) });
  } catch (error) {
    console.error('Banner creation error:', error);
    res.status(500).json({ message: 'Failed to create banner' });
  }
}

async function updateBanner(req, res) {
  const { id } = req.params;
  const {
    title,
    subtitle,
    description,
    image,
    mobile_image,
    link,
    type,
    active
  } = req.body;

  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ message: 'Invalid banner id' });
  }
  if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({ message: 'Banner title cannot be empty' });
  }
  if (type !== undefined && !['hero', 'offer'].includes(type)) {
    return res.status(400).json({ message: 'Banner type must be hero or offer' });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE banners
       SET title = COALESCE(?, title),
           subtitle = ?, description = ?, image = COALESCE(?, image),
           mobile_image = ?, link = ?, type = COALESCE(?, type),
           active = COALESCE(?, active)
       WHERE id = ?`,
      [
        title === undefined ? null : title.trim(),
        subtitle ?? null,
        description ?? null,
        image === undefined ? null : image.trim(),
        mobile_image ?? null,
        link ?? null,
        type ?? null,
        active === undefined ? null : (active === false || active === 0 || active === 'false' ? 0 : 1),
        Number(id)
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [Number(id)]);
    res.json({ message: 'Banner updated', data: serializeBanner(rows[0]) });
  } catch (error) {
    console.error('Banner update error:', error);
    res.status(500).json({ message: 'Failed to update banner' });
  }
}

async function deleteBanner(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    return res.status(400).json({ message: 'Invalid banner id' });
  }

  try {
    const [result] = await pool.execute('DELETE FROM banners WHERE id = ?', [Number(id)]);
    if (!result.affectedRows) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    console.error('Banner deletion error:', error);
    res.status(500).json({ message: 'Failed to delete banner' });
  }
}

function uploadBannerImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Select an image to upload' });
  }

  res.status(201).json({
    message: 'Banner image uploaded',
    url: `/public/banner-images/${path.basename(req.file.filename)}`
  });
}

module.exports = {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadBannerImage
};
