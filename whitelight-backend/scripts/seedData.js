#!/usr/bin/env node
/**
 * Seed database using credentials from .env
 * - Ensures admin table exists and creates default admin if none
 * Usage: npm run seed   or   node scripts/seedData.js
 */
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'whitelight_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  };

  if (!config.user || !config.password) {
    console.error('❌ Set DB_USER and DB_PASSWORD in .env');
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database');

    // Create admin table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'super_admin') DEFAULT 'admin',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Admins table ready');

    // Seed default admin if none exists
    const defaultUsername = 'admin';
    const defaultEmail = 'admin@whitelight.com';
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const [existing] = await connection.execute(
      'SELECT id FROM admins WHERE username = ? OR email = ?',
      [defaultUsername, defaultEmail]
    );

    if (existing.length === 0) {
      await connection.execute(
        'INSERT INTO admins (username, email, password, role) VALUES (?, ?, ?, ?)',
        [defaultUsername, defaultEmail, hashedPassword, 'super_admin']
      );
      console.log('✅ Default admin created (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Default admin already exists');
    }

    console.log('\n✅ Seed completed.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
