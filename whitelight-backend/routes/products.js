const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');
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
router.get('/', productController.getProducts);

// GET /api/products/categories - Get product categories
router.get('/categories', productController.getCategories);

// GET /api/products/brands - Get product brands
router.get('/brands', productController.getBrands);

// Admin protected routes - MUST come before /:id route to avoid route conflicts
// POST /api/products/images - Upload images separately (admin only)
router.post('/images', authenticateToken, upload.array('images', 10), productController.uploadImages);

// GET /api/products/:id - Get specific product (must come after specific routes)
router.get('/:id', productController.getProduct);

// POST /api/products - Create new product (admin only)
router.post('/', authenticateToken, upload.array('images', 10), productController.createProduct);

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticateToken, upload.array('images', 10), productController.updateProduct);

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;