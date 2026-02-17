/**
 * Test script: Admin image upload (create product with image).
 *
 * Run from whitelight-backend:
 *   node scripts/test-image-upload.js
 *
 * Test against local backend (requires MySQL + server running):
 *   node scripts/test-image-upload.js
 *
 * Test against production API:
 *   API_BASE_URL=https://api.whitelightstore.co.ke/api node scripts/test-image-upload.js
 *
 * Requires: backend .env with DB and DO_SPACES_* set; backend server running.
 * Optional: ADMIN_USERNAME, ADMIN_PASSWORD; API_BASE_URL for target API.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Minimal 1x1 PNG (valid PNG file)
const MINI_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAHEQG8K4TfsQAAAABJRU5ErkJggg==',
  'base64'
);

async function login() {
  const res = await fetch(`${BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
  });
  const data = await res.json();
  if (!data.success || !data.data?.token) {
    throw new Error(data.message || 'Login failed');
  }
  return data.data.token;
}

async function createProductWithImage(token) {
  const form = new FormData();
  const uniqueName = `Test Product Image Upload ${Date.now()}`;
  form.append('name', uniqueName);
  form.append('brand', 'TestBrand');
  form.append('category', 'running');
  form.append('price', '9999');
  form.append('description', 'Created by test-image-upload script');
  form.append('tags', JSON.stringify(['test']));
  form.append('isNew', 'false');
  form.append('isBestSeller', 'false');
  form.append('isOnOffer', 'false');
  form.append('variants', JSON.stringify([{ id: 'v-40', size: 40, inStock: true, stockQuantity: 10 }]));

  const blob = new Blob([MINI_PNG], { type: 'image/png' });
  form.append('images', blob, 'test-image.png');

  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Create product failed');
  }
  return data;
}

async function getProduct(token, productId) {
  const res = await fetch(`${BASE}/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error('Get product failed');
  return data.data;
}

async function run() {
  console.log('🔐 Logging in...');
  const token = await login();
  console.log('✅ Login OK');

  console.log('📤 Creating product with image...');
  const createRes = await createProductWithImage(token);
  if (!createRes.success || !createRes.data?.id) {
    throw new Error(createRes.message || 'No product id in response');
  }
  const productId = createRes.data.id;
  console.log('✅ Product created:', productId);

  const product = await getProduct(token, productId);
  const images = product.images || [];
  if (images.length === 0) {
    throw new Error('Product has no images – upload may have failed');
  }
  console.log('✅ Image uploaded:', images[0].url);

  console.log('\n✅ Image upload test passed.');
  console.log('   Product id:', productId);
  console.log('   Image URL:', images[0].url);
}

run().catch((err) => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
