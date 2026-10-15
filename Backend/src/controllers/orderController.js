const { randomBytes } = require('crypto');
const { pool } = require('../config/db');

function mapOrder(row) {
  return {
    id: Number(row.id),
    orderNumber: row.order_number,
    status: row.status,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    address: {
      addressLine1: row.address_line1,
      addressLine2: row.address_line2 || '',
      pincode: row.pincode,
      city: row.city,
      state: row.state
    },
    deliveryOption: row.delivery_option,
    paymentMethod: row.payment_method,
    subtotal: Number(row.subtotal),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapOrderItem(row) {
  return {
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image || '',
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    lineTotal: Number(row.line_total)
  };
}

async function createOrder(req, res) {
  const { addressId, deliveryOption = 'standard', paymentMethod = 'contact' } = req.body;
  const parsedAddressId = Number(addressId);
  if (!Number.isSafeInteger(parsedAddressId) || parsedAddressId < 1) {
    return res.status(400).json({ message: 'A valid addressId is required' });
  }
  if (!['standard', 'express'].includes(deliveryOption)) {
    return res.status(400).json({ message: 'deliveryOption must be standard or express' });
  }
  if (!['contact', 'cod'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'paymentMethod must be contact or cod' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [addresses] = await connection.execute(
      'SELECT * FROM customer_addresses WHERE id = ? AND user_id = ? FOR UPDATE',
      [parsedAddressId, req.user.user_id]
    );
    if (addresses.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Delivery address not found' });
    }

    const [cartItems] = await connection.execute(
      'SELECT product_id, quantity FROM cart_items WHERE user_id = ? ORDER BY product_id FOR UPDATE',
      [req.user.user_id]
    );
    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const orderItems = [];
    let subtotal = 0;
    for (const cartItem of cartItems) {
      const [products] = await connection.execute(
        `SELECT product_id, name, images, price, offer_price, stock, status
         FROM products WHERE product_id = ? FOR UPDATE`,
        [cartItem.product_id]
      );
      const product = products[0];
      if (!product || product.status !== 'Active') {
        await connection.rollback();
        return res.status(409).json({ message: `Product ${cartItem.product_id} is no longer available` });
      }
      const quantity = Number(cartItem.quantity);
      if (quantity < 1 || quantity > Number(product.stock)) {
        await connection.rollback();
        return res.status(409).json({ message: `Insufficient stock for ${product.name}` });
      }

      const regularPrice = Number(product.price) || 0;
      const offerPrice = Number(product.offer_price) || 0;
      const unitPrice = offerPrice > 0 ? offerPrice : regularPrice;
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      let productImage = '';
      try {
        const images = product.images ? JSON.parse(product.images) : [];
        productImage = Array.isArray(images) ? images[0] || '' : '';
      } catch (error) {
        console.error(`Could not parse image for order product ${product.product_id}:`, error);
      }
      subtotal += lineTotal;
      orderItems.push({
        productId: product.product_id,
        productName: product.name,
        productImage,
        quantity,
        unitPrice,
        lineTotal
      });
    }
    subtotal = Math.round(subtotal * 100) / 100;

    const orderNumber = `GS-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
    const address = addresses[0];
    const [insertResult] = await connection.execute(
      `INSERT INTO orders
        (order_number, user_id, status, full_name, phone, email, address_line1,
         address_line2, pincode, city, state, delivery_option, payment_method, subtotal)
       VALUES (?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        req.user.user_id,
        address.full_name,
        address.phone,
        address.email,
        address.address_line1,
        address.address_line2,
        address.pincode,
        address.city,
        address.state,
        deliveryOption,
        paymentMethod,
        subtotal
      ]
    );
    const id = Number(insertResult.insertId);

    for (const item of orderItems) {
      await connection.execute(
        `INSERT INTO order_items
          (order_id, product_id, product_name, product_image, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.productId,
          item.productName,
          item.productImage || null,
          item.quantity,
          item.unitPrice,
          item.lineTotal
        ]
      );
      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE product_id = ? AND stock >= ?',
        [item.quantity, item.productId, item.quantity]
      );
    }

    await connection.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.user_id]);
    await connection.commit();
    return res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id,
        orderNumber,
        status: 'Pending',
        deliveryOption,
        paymentMethod,
        subtotal,
        items: orderItems
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Failed to place order' });
  } finally {
    if (connection) connection.release();
  }
}

async function getOrders(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.user_id]
    );
    return res.json({ orders: rows.map(mapOrder) });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Failed to load orders' });
  }
}

async function getOrderById(req, res) {
  try {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.user_id]
    );
    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [items] = await pool.execute(
      'SELECT product_id, product_name, product_image, quantity, unit_price, line_total FROM order_items WHERE order_id = ?',
      [req.params.id]
    );
    return res.json({ order: { ...mapOrder(orders[0]), items: items.map(mapOrderItem) } });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ message: 'Failed to load order' });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};
