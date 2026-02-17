/**
 * Test script: Upload product with 10 images
 * 
 * Run from whitelight-backend:
 *   node scripts/test-10-images-upload.js
 * 
 * Test against production API:
 *   API_BASE_URL=https://api.whitelightstore.co.ke/api node scripts/test-10-images-upload.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Minimal 1x1 PNG (valid PNG file) - we'll create 10 of these
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

async function createProductWith10Images(token) {
  const form = new FormData();
  const uniqueName = `Test Product 10 Images ${Date.now()}`;
  const timestamp = Date.now();
  
  form.append('name', uniqueName);
  form.append('brand', 'TestBrand');
  form.append('category', 'running');
  form.append('price', '9999');
  form.append('description', 'Test product with 10 images uploaded simultaneously');
  form.append('tags', JSON.stringify(['test', '10-images']));
  form.append('isNew', 'true');
  form.append('isBestSeller', 'false');
  form.append('isOnOffer', 'false');
  
  // Add variants (sizes 36-40)
  const variants = [36, 37, 38, 39, 40].map(size => ({
    id: `v-${size}`,
    size: size,
    inStock: true,
    stockQuantity: 10
  }));
  form.append('variants', JSON.stringify(variants));

  // Add 10 images
  console.log('📸 Adding 10 images to form...');
  for (let i = 0; i < 10; i++) {
    const blob = new Blob([MINI_PNG], { type: 'image/png' });
    form.append('images', blob, `test-image-${i + 1}.png`);
  }
  console.log('✅ All 10 images added to form');

  console.log('📤 Sending request to server...');
  const startTime = Date.now();
  
  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  console.log(`⏱️  Request completed in ${duration} seconds`);

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      const text = await res.text();
      if (text) errorMessage = text.substring(0, 200);
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return { data, duration };
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
  console.log('🧪 Testing 10 Image Upload\n');
  console.log('='.repeat(50));
  
  try {
    console.log('\n🔐 Step 1: Logging in...');
    const token = await login();
    console.log('✅ Login successful');

    console.log('\n📤 Step 2: Creating product with 10 images...');
    const createRes = await createProductWith10Images(token);
    
    if (!createRes.data.success || !createRes.data.data?.id) {
      throw new Error(createRes.data.message || 'No product id in response');
    }
    const productId = createRes.data.data.id;
    console.log(`✅ Product created: ${productId}`);
    console.log(`⏱️  Upload duration: ${createRes.duration} seconds`);

    console.log('\n🔍 Step 3: Verifying uploaded images...');
    const product = await getProduct(token, productId);
    const images = product.images || [];
    
    console.log(`📊 Images found in database: ${images.length}/10`);
    
    if (images.length === 0) {
      throw new Error('❌ Product has no images – upload failed');
    }
    
    if (images.length < 10) {
      console.warn(`⚠️  Warning: Expected 10 images, but only ${images.length} were saved`);
    }
    
    console.log('\n📸 Image URLs:');
    images.forEach((img, index) => {
      console.log(`   ${index + 1}. ${img.url}`);
    });

    console.log('\n' + '='.repeat(50));
    if (images.length === 10) {
      console.log('✅ SUCCESS: All 10 images uploaded and saved to database!');
    } else {
      console.log(`⚠️  PARTIAL SUCCESS: ${images.length}/10 images saved`);
    }
    console.log(`   Product ID: ${productId}`);
    console.log(`   Upload time: ${createRes.duration}s`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

run();
