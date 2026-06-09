const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

function normalizeSubcategories(subcategories) {
  if (!subcategories) return [];
  
  let parsed = subcategories;
  if (typeof subcategories === 'string') {
    try {
      parsed = JSON.parse(subcategories);
    } catch (e) {
      parsed = subcategories.split(/[,\n]/);
    }
  }
  
  if (Array.isArray(parsed)) {
    return parsed.filter(Boolean).map((item) => String(item).trim());
  }
  
  return [];
}

function isDataURI(value) {
  return typeof value === 'string' && /^data:[\w+-]+\/[\w+.-]+;base64,/.test(value);
}

function getMimeTypeFromFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

async function fileToDataURI(filePath, mimeType) {
  const fileBuffer = await fs.promises.readFile(filePath);
  return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

async function createCategory(req, res) {
  const { 
    categoryId, 
    categoryName, 
    description, 
    status, 
    featured, 
    subCategories,
    createdAt,
    updatedAt
  } = req.body;

  if (!categoryId || !categoryName) {
    return res.status(400).json({ message: 'categoryId and categoryName are required' });
  }

  const normalizedSubcategories = normalizeSubcategories(subCategories);
  const featuredFlag = featured === 'true' || featured === true ? 1 : 0;
  const categoryStatus = status === 'Inactive' ? 'Inactive' : 'Active';
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const createdAtTime = createdAt ? createdAt.slice(0, 19).replace('T', ' ') : now;
  const updatedAtTime = updatedAt ? updatedAt.slice(0, 19).replace('T', ' ') : now;

  let imageData = null;
  let uploadedImagePath = null;

  if (req.file) {
    // Store the relative path instead of converting to large base64 strings
    imageData = `/public/category-images/${req.file.filename}`;
  } else if (req.body.image && typeof req.body.image === 'string') {
    imageData = req.body.image;
  }

  try {
    const connection = await pool.getConnection();
    try {
      const [existing] = await connection.execute(
        'SELECT id FROM categories WHERE category_id = ?',
        [categoryId]
      );

      if (existing.length > 0) {
        return res.status(409).json({ message: 'Category already exists' });
      }

      const [result] = await connection.execute(
        `INSERT INTO categories
          (category_id, name, description, image, status, featured, subcategories, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          categoryId,
          categoryName,
          description || null,
          imageData,
          categoryStatus,
          featuredFlag,
          JSON.stringify(normalizedSubcategories),
          createdAtTime,
          updatedAtTime
        ]
      );

      // We no longer delete the uploaded image since we store its path in the database.

      res.status(201).json({
        message: 'Category created',
        category: {
          id: result.insertId,
          categoryId: categoryId,
          categoryName: categoryName,
          description,
          image: imageData,
          status: categoryStatus,
          featured: !!featuredFlag,
          subCategories: normalizedSubcategories,
          createdAt: createdAtTime,
          updatedAt: updatedAtTime
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Category creation error:', error);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
}

async function getCategories(req, res) {
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, category_id, name, description, image, status, featured, subcategories, created_at, updated_at FROM categories ORDER BY created_at DESC'
      );

      const categories = await Promise.all(rows.map(async (row) => {
        let image = row.image || null;

        // If the image is stored as just a filename (old behavior) or path, format it correctly
        if (image && !isDataURI(image) && !image.startsWith('/public/')) {
          image = `/public/category-images/${path.basename(image)}`;
        }

        return {
          categoryId: row.category_id,
          categoryName: row.name,
          description: row.description,
          image: image || null,
          status: row.status,
          featured: !!row.featured,
          subCategories: (() => {
            if (!row.subcategories) return [];
            try {
              return JSON.parse(row.subcategories);
            } catch {
              return typeof row.subcategories === 'string'
                ? row.subcategories.split(/[,\n]/).map((item) => item.trim()).filter(Boolean)
                : [];
            }
          })(),
          createdAt: row.created_at,
          updatedAt: row.updated_at
        };
      }));

      res.json({ categories });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to load categories', error: error.message });
  }
}

module.exports = {
  createCategory,
  getCategories
};
