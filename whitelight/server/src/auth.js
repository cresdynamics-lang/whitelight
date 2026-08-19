import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "./config.js";
import { query } from "./db.js";

export async function loginAdmin(email, password) {
  const { rows } = await query(
    `SELECT id, email, username, role, password_hash FROM admins WHERE email = $1 LIMIT 1`,
    [email]
  );
  const admin = rows[0];
  if (!admin) return null;

  let ok = false;
  try {
    ok = await bcrypt.compare(password, admin.password_hash);
  } catch {
    ok = false;
  }
  if (!ok) {
    const { rows: cryptRows } = await query(
      `SELECT (password_hash = crypt($1, password_hash)) AS matched FROM admins WHERE id = $2`,
      [password, admin.id]
    );
    ok = Boolean(cryptRows[0]?.matched);
  }
  if (!ok) return null;

  const user = {
    id: Number(admin.id),
    email: admin.email,
    username: admin.username,
    role: admin.role,
  };
  const token = jwt.sign(user, config.jwtSecret, { expiresIn: "7d" });
  return { user, token };
}

export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    req.admin = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
