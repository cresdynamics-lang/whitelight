/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml with all products dynamically
 * Access at: /api/sitemap.xml
 */
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://whitelightstore.co.ke';
    const today = new Date().toISOString().split('T')[0];
    
    // Static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/category/running', priority: '0.9', changefreq: 'weekly' },
      { url: '/category/trail', priority: '0.9', changefreq: 'weekly' },
      { url: '/category/gym', priority: '0.9', changefreq: 'weekly' },
      { url: '/category/training', priority: '0.9', changefreq: 'weekly' },
      { url: '/category/basketball', priority: '0.9', changefreq: 'weekly' },
      { url: '/category/accessories', priority: '0.8', changefreq: 'weekly' },
      { url: '/buying-guide', priority: '0.8', changefreq: 'monthly' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/new-arrivals', priority: '0.8', changefreq: 'weekly' },
    ];

    // Fetch all products
    const [products] = await pool.execute(
      'SELECT id, slug, name, category, updated_at FROM products WHERE slug IS NOT NULL ORDER BY updated_at DESC'
    );

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    staticPages.forEach(page => {
      sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Add product pages
    products.forEach(product => {
      const lastmod = product.updated_at 
        ? new Date(product.updated_at).toISOString().split('T')[0]
        : today;
      
      sitemap += `  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    });

    sitemap += '</urlset>';

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
