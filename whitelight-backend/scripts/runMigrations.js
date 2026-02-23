#!/usr/bin/env node
/**
 * Run all migrations in order using DB credentials from .env
 * Usage: node scripts/runMigrations.js
 */
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const migrationOrder = [
  '001_initial_schema.sql',
  '002_add_accessories_category.sql',
  '002_add_order_item_details.sql',
  '004_add_multiple_categories.sql',
  '005_add_training_category.sql',
];

async function run() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'whitelight_db',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true,
  };

  if (!config.user || !config.password) {
    console.error('❌ Set DB_USER and DB_PASSWORD in .env');
    process.exit(1);
  }

  let connection;
  try {
    // Connect without database first to create it if needed
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port,
      multipleStatements: true,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    await connection.changeUser({ database: config.database });

    console.log('✅ Connected to MySQL');
    console.log(`📂 Running migrations from ${MIGRATIONS_DIR}\n`);

    for (const file of migrationOrder) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skip ${file} (not found)`);
        continue;
      }
      let sql = fs.readFileSync(filePath, 'utf8');
      // Remove USE whitelight_db; and use current database
      sql = sql.replace(/USE\s+whitelight_db\s*;/gi, '');
      if (!sql.trim()) continue;
      try {
        await connection.query(sql);
        console.log(`✅ ${file}`);
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.message && err.message.includes('already exists')) {
          console.log(`⏭️  ${file} (already applied)`);
        } else {
          console.error(`❌ ${file}:`, err.message);
          throw err;
        }
      }
    }

    console.log('\n✅ All migrations completed.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
