import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

if (!config.databaseUrl) {
  console.warn("[db] DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString: config.databaseUrl || undefined,
  ssl: process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined,
  max: 5,
});

export async function query(text, params) {
  return pool.query(text, params);
}
