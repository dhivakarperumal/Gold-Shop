const { pool } = require('../config/db');

function firstProductImage(images) {
  if (!images) return null;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed[0] || null : null;
  } catch (error) {
    console.error('Could not parse product images for cart snapshot:', error);
    return null;
  }
}

function mapCartItem(row) {
  const image = row.product_image || firstProductImage(row.images);
  return {
    product: {
      id: row.product_id,
      name: row.product_name || row.name,
      category: row.category || '',
      purity: row.purity || '',
      weight: Number(row.weight) || 0,
      weightUnit: row.weight_unit || '',
      price: Number(row.price) || 0,
      offerPrice: Number(row.offer_price) || 0,
      stock: Number(row.stock) || 0,
      image: image || ''
    },
    quantity: Number(row.quantity)
  };
}

async function getCart(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT c.quantity, c.product_name, c.product_image,
              COALESCE(c.price, p.price) AS price,
              COALESCE(c.offer_price, p.offer_price) AS offer_price,
              p.product_id, p.name, p.category, p.purity, p.weight,
              p.weight_unit, p.stock, p.images
       FROM cart_items c
       JOIN products p ON p.product_id = c.product_id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.user_id]
    );
    return res.json({ items: rows.map(mapCartItem) });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ message: 'Failed to load cart' });
  }
}

async function addCartItem(req, res) {
  const { productId, quantity = 1 } = req.body;
  if (typeof productId !== 'string' || !productId.trim()) {
    return res.status(400).json({ message: 'productId is required' });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: 'quantity must be a positive integer' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [products] = await connection.execute(
      `SELECT product_id, name, price, offer_price, images, stock, status
       FROM products WHERE product_id = ? FOR UPDATE`,
      [productId.trim()]
    );
    if (products.length === 0 || products[0].status !== 'Active') {
      await connection.rollback();
      return res.status(404).json({ message: 'Available product not found' });
    }

    const [items] = await connection.execute(
      'SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ? FOR UPDATE',
      [req.user.user_id, productId.trim()]
    );
    const nextQuantity = (items[0]?.quantity || 0) + quantity;
    if (nextQuantity > products[0].stock) {
      await connection.rollback();
      return res.status(409).json({ message: 'Requested quantity exceeds available stock' });
    }

    const product = products[0];
    await connection.execute(
      `INSERT INTO cart_items
        (user_id, product_id, quantity, product_name, product_image, price, offer_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         quantity = VALUES(quantity),
         product_name = VALUES(product_name),
         product_image = VALUES(product_image),
         price = VALUES(price),
         offer_price = VALUES(offer_price)`,
      [
        req.user.user_id,
        productId.trim(),
        nextQuantity,
        product.name,
        firstProductImage(product.images),
        product.price,
        product.offer_price
      ]
    );

    await connection.commit();
    return res.status(200).json({ message: 'Product added to cart', quantity: nextQuantity });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Add cart item error:', error);
    return res.status(500).json({ message: 'Failed to add product to cart' });
  } finally {
    if (connection) connection.release();
  }
}

async function replaceCart(req, res) {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'items must be an array' });
  }

  const quantities = new Map();
  for (const item of items) {
    if (
      !item
      || typeof item.productId !== 'string'
      || !item.productId.trim()
      || !Number.isInteger(item.quantity)
      || item.quantity < 1
    ) {
      return res.status(400).json({ message: 'Each item requires a productId and positive integer quantity' });
    }
    const productId = item.productId.trim();
    quantities.set(productId, (quantities.get(productId) || 0) + item.quantity);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const [productId, quantity] of quantities) {
      const [products] = await connection.execute(
        'SELECT name, images, price, offer_price, stock, status FROM products WHERE product_id = ? FOR UPDATE',
        [productId]
      );
      if (products.length === 0 || products[0].status !== 'Active') {
        await connection.rollback();
        return res.status(404).json({ message: `Available product not found: ${productId}` });
      }
      if (quantity > Number(products[0].stock)) {
        await connection.rollback();
        return res.status(409).json({ message: `Requested quantity exceeds available stock for ${productId}` });
      }
    }

    await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.user_id]);
    for (const [productId, quantity] of quantities) {
      const [products] = await connection.execute(
        'SELECT name, images, price, offer_price FROM products WHERE product_id = ?',
        [productId]
      );
      const product = products[0];
      await connection.execute(
        `INSERT INTO cart_items
          (user_id, product_id, quantity, product_name, product_image, price, offer_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.user_id,
          productId,
          quantity,
          product.name,
          firstProductImage(product.images),
          product.price,
          product.offer_price
        ]
      );
    }
    await connection.commit();
    return res.json({ message: 'Cart synchronized', itemCount: quantities.size });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Replace cart error:', error);
    return res.status(500).json({ message: 'Failed to synchronize cart' });
  } finally {
    if (connection) connection.release();
  }
}

async function updateCartItem(req, res) {
  const { productId } = req.params;
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: 'quantity must be a positive integer' });
  }

  try {
    const [products] = await pool.execute(
      'SELECT stock, status FROM products WHERE product_id = ?',
      [productId]
    );
    if (products.length === 0 || products[0].status !== 'Active') {
      return res.status(404).json({ message: 'Available product not found' });
    }
    if (quantity > products[0].stock) {
      return res.status(409).json({ message: 'Requested quantity exceeds available stock' });
    }

    const [result] = await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, req.user.user_id, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    return res.json({ message: 'Cart quantity updated', quantity });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({ message: 'Failed to update cart item' });
  }
}

async function removeCartItem(req, res) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [req.user.user_id, req.params.productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    return res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return res.status(500).json({ message: 'Failed to remove cart item' });
  }
}

async function clearCart(req, res) {
  try {
    await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.user_id]);
    return res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ message: 'Failed to clear cart' });
  }
}

module.exports = {
  getCart,
  addCartItem,
  replaceCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
