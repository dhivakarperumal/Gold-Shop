const path = require('path');
const { pool } = require('../config/db');

async function createProduct(req, res) {
  try {
    const {
      productId, name, category, subCategory, brand, purity, hallmark,
      certificate, weight, weightUnit, coinWeight, makingCharges,
      wastagePercentage, price, offerPrice, discount, stock, sku, gender,
      occasion, color, material, size, lengthOptions, description, features,
      dimensions, shipping, returnPolicy, seo, status, featured, bestSeller, newArrival
    } = req.body;

    if (!productId || !name) {
      return res.status(400).json({ message: 'productId and name are required' });
    }

    // Process uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/public/product-images/${file.filename}`);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    const connection = await pool.getConnection();
    try {
      // Check if product exists
      const [existing] = await connection.execute(
        'SELECT id FROM products WHERE product_id = ?',
        [productId]
      );

      if (existing.length > 0) {
        return res.status(409).json({ message: 'Product already exists' });
      }

      const [result] = await connection.execute(
        `INSERT INTO products
          (product_id, name, category, sub_category, brand, purity, hallmark,
           certificate, weight, weight_unit, coin_weight, making_charges,
           wastage_percentage, price, offer_price, discount, stock, sku, gender,
           occasion, color, material, size, length_options, description, features,
           dimensions, shipping, return_policy, seo, images, status, featured,
           best_seller, new_arrival)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId, name, category, subCategory, brand, purity,
          hallmark === 'true' || hallmark === true ? 1 : 0,
          certificate,
          weight || 0, weightUnit, coinWeight || null,
          makingCharges || 0, wastagePercentage || 0, price || 0, offerPrice || 0, discount || 0,
          stock || 0, sku, gender,
          occasion || '[]', color, material,
          size || '[]', lengthOptions || '[]',
          description || null,
          features || '[]',
          dimensions || '{}', shipping || '{}', returnPolicy || '{}', seo || '{}',
          JSON.stringify(images),
          status || 'Active',
          featured === 'true' || featured === true ? 1 : 0,
          bestSeller === 'true' || bestSeller === true ? 1 : 0,
          newArrival === 'true' || newArrival === true ? 1 : 0
        ]
      );

      res.status(201).json({
        message: 'Product created successfully',
        productId: productId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
}

async function getProducts(req, res) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM products ORDER BY created_at DESC');
      
      const products = rows.map(row => {
        const parseJSON = (str) => {
          try { return str ? JSON.parse(str) : null; } catch { return str; }
        };

        return {
          id: row.id,
          productId: row.product_id,
          name: row.name,
          category: row.category,
          subCategory: row.sub_category,
          brand: row.brand,
          purity: row.purity,
          hallmark: !!row.hallmark,
          certificate: row.certificate,
          weight: row.weight,
          weightUnit: row.weight_unit,
          coinWeight: row.coin_weight,
          makingCharges: row.making_charges,
          wastagePercentage: row.wastage_percentage,
          price: row.price,
          offerPrice: row.offer_price,
          discount: row.discount,
          stock: row.stock,
          sku: row.sku,
          gender: row.gender,
          occasion: parseJSON(row.occasion),
          color: row.color,
          material: row.material,
          size: parseJSON(row.size),
          lengthOptions: parseJSON(row.length_options),
          description: row.description,
          features: parseJSON(row.features),
          dimensions: parseJSON(row.dimensions),
          shipping: parseJSON(row.shipping),
          returnPolicy: parseJSON(row.return_policy),
          seo: parseJSON(row.seo),
          images: parseJSON(row.images) || [],
          status: row.status,
          featured: !!row.featured,
          bestSeller: !!row.best_seller,
          newArrival: !!row.new_arrival,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      });

      res.json({ products });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to load products', error: error.message });
  }
}

module.exports = {
  createProduct,
  getProducts
};
