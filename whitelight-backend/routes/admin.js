const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

// POST /api/admin/login - Admin login
router.post('/login', asyncHandler(adminController.login.bind(adminController)));

// GET /api/admin/profile - Get admin profile (protected)
router.get('/profile', authenticateToken, asyncHandler(adminController.getProfile.bind(adminController)));

// PUT /api/admin/change-password - Change password (protected)
router.put('/change-password', authenticateToken, asyncHandler(adminController.changePassword.bind(adminController)));

module.exports = router;