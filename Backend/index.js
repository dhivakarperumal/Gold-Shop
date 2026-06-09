require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./src/config/db');
const authRoutes = require('./src/routers/authRoutes');
const categoryRoutes = require('./src/routers/categoryRoutes');
const productRoutes = require('./src/routers/productRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files for uploaded images
app.use('/public', express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Gold Shop Management Backend is running' });
});

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// Start server
app.listen(PORT, async () => {
  await initializeDatabase();
  console.log(`Backend server is running on port ${PORT}`);
});
