// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// Do NOT load dotenv here - config/database.js loads .env from backend folder explicitly.
// Loading here uses process.cwd() which can be wrong when run via PM2.

const { testConnection } = require('./config/database');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const bannerRoutes = require('./routes/banners');
const sitemapRoutes = require('./routes/sitemap');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Configure helmet to allow file uploads
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
})); // Security headers
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://whitelightstore.co.ke',
  'https://whitelight.co.ke',
  'http://localhost:8080',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    // Log blocked origins for debugging
    console.log('CORS blocked origin:', origin);
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
})); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies (increased for multiple images)
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded bodies

// Test database connection
testConnection();

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'WhiteLight API Server',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api', sitemapRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhiteLight API Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;