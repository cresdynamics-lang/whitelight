#!/usr/bin/env node
/**
 * PM2 entry: load .env from this directory then start server.
 * Use: pm2 start start-with-env.js --name whitelight-backend
 */
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

if (!process.env.DB_USER) {
  console.error('[start-with-env] DB_USER not set. Check .env at', envPath);
}

require('./server.js');
