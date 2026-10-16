const { pool } = require('../config/db');

function firstProductImage(images) {
  if (!images) return '';
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed[0] || '' : '';
  } catch (error) {
    console.error('Could not parse product images for wishlist:', error);
    return '';
  }
}

function mapWishlistProduct(row) {
  return {
    id: row.product_id,
    name: row.name,
    category: row.category || '',
    purity: row.purity || '',
    weight: Number(row.weight) || 0,
    weightUnit: row.weight_unit || '',
    price: Number(row.price) || 0,
    offerPrice: Number(row.offer_price) || 0,
    stock: Number(row.stock) || 0,
    image: firstProductImage(row.images)
  };
}

async function getWishlist(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT p.product_id, p.name, p.category, p.purity, p.weight, p.weight_unit,
              p.price, p.offer_price, p.stock, p.images
       FROM wishlist_items w
       JOIN products p ON p.product_id = w.product_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.user_id]
    );
    return res.json({ items: rows.map(mapWishlistProduct) });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return res.status(500).json({ message: 'Failed to load wishlist' });
  }
}

async function addWishlistItem(req, res) {
  const { productId } = req.body;
  if (typeof productId !== 'string' || !productId.trim()) {
    return res.status(400).json({ message: 'productId is required' });
  }

  try {
    const [products] = await pool.execute(
      'SELECT product_id FROM products WHERE product_id = ? AND status = ?',
      [productId.trim(), 'Active']
    );
    if (products.length === 0) {
      return res.status(404).json({ message: 'Available product not found' });
    }
    await pool.execute(
      `INSERT INTO wishlist_items (user_id, product_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE product_id = VALUES(product_id)`,
      [req.user.user_id, productId.trim()]
    );
    return res.status(200).json({ message: 'Product added to wishlist' });
  } catch (error) {
    console.error('Add wishlist item error:', error);
    return res.status(500).json({ message: 'Failed to add product to wishlist' });
  }
}

async function removeWishlistItem(req, res) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [req.user.user_id, req.params.productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }
    return res.json({ message: 'Product removed from wishlist' });
  } catch (error) {
    console.error('Remove wishlist item error:', error);
    return res.status(500).json({ message: 'Failed to remove product from wishlist' });
  }
}

module.exports = {
  getWishlist,
  addWishlistItem,
  removeWishlistItem
};
