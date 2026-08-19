#!/usr/bin/env node
/**
 * Create or update admin login in Postgres (bcrypt hash).
 * Usage: DATABASE_URL=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node server/scripts/upsert-admin.mjs
 */
import bcrypt from "bcryptjs";
import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env.do") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const email = (process.env.ADMIN_EMAIL || "admin@whitelightstore.co.ke").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "Ibrahim@Admin";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();

try {
  const { rows } = await client.query(
    `INSERT INTO admins (email, username, password_hash, role)
     VALUES ($1, $1, $2, 'admin')
     ON CONFLICT (email) DO UPDATE SET
       password_hash = EXCLUDED.password_hash,
       username = EXCLUDED.username,
       role = 'admin',
       updated_at = NOW()
     RETURNING id, email, role`,
    [email, hash]
  );
  console.log("Admin upserted:", rows[0]);
} finally {
  await client.end();
}
