const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const multer = require('multer');

// Configure multer for memory storage with increased limits
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10 // Max 10 files
  }
});

// GET /api/products - Get all products with filtering
router.get('/', asyncHandler(productController.getProducts.bind(productController)));

// GET /api/products/categories - Get product categories
router.get('/categories', asyncHandler(productController.getCategories.bind(productController)));

// GET /api/products/brands - Get product brands
router.get('/brands', asyncHandler(productController.getBrands.bind(productController)));

// Admin protected routes - MUST come before /:id route to avoid route conflicts
// POST /api/products/images - Upload images separately (admin only)
router.post('/images', authenticateToken, upload.array('images', 10), asyncHandler(productController.uploadImages.bind(productController)));

// GET /api/products/:id - Get specific product (must come after specific routes)
router.get('/:id', asyncHandler(productController.getProduct.bind(productController)));

// POST /api/products - Create new product (admin only)
router.post('/', authenticateToken, upload.array('images', 10), asyncHandler(productController.createProduct.bind(productController)));

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticateToken, upload.array('images', 10), asyncHandler(productController.updateProduct.bind(productController)));

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticateToken, asyncHandler(productController.deleteProduct.bind(productController)));

module.exports = router;