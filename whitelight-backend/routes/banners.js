const express = require('express');
const bannerController = require('../controllers/bannerController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

// Get hero carousel images
router.get('/hero', asyncHandler(bannerController.getHeroImages.bind(bannerController)));

// Get category images
router.get('/categories', asyncHandler(bannerController.getCategoryImages.bind(bannerController)));

// Get CTA banner images
router.get('/cta', asyncHandler(bannerController.getCtaImages.bind(bannerController)));

module.exports = router;