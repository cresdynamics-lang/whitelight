import path from "node:path";
import fs from "node:fs";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { config } from "./config.js";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const MAX_WIDTH = 1600;
const DEFAULT_Q = 68;

function resolveUploadPath(rawSrc) {
  if (!rawSrc || typeof rawSrc !== "string") return null;
  let src = rawSrc.trim();
  try {
    src = decodeURIComponent(src);
  } catch {
    /* keep raw */
  }
  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const u = new URL(src);
      src = u.pathname;
    } catch {
      return null;
    }
  }
  if (!src.startsWith("/uploads/")) return null;
  const rel = src.slice("/uploads/".length);
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) return null;
  const abs = path.resolve(config.uploadsDir, rel);
  const root = path.resolve(config.uploadsDir);
  if (!abs.startsWith(root + path.sep) && abs !== root) return null;
  return abs;
}

function preferWebpSibling(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".webp") return filePath;
  const webp = filePath.slice(0, -ext.length) + ".webp";
  if (fs.existsSync(webp)) return webp;
  return filePath;
}

/**
 * GET /api/img?src=/uploads/...&w=280&q=62
 * Serves cached resized WebP for product cards / PDP.
 */
export async function handleImg(req, res) {
  try {
    const src = String(req.query.src || "");
    const width = Math.min(
      MAX_WIDTH,
      Math.max(40, parseInt(String(req.query.w || "280"), 10) || 280)
    );
    const quality = Math.min(
      90,
      Math.max(40, parseInt(String(req.query.q || String(DEFAULT_Q)), 10) || DEFAULT_Q)
    );

    const abs = resolveUploadPath(src);
    if (!abs || !fs.existsSync(abs)) {
      res.status(404).json({ error: "Image not found" });
      return;
    }

    const ext = path.extname(abs).toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      res.status(400).json({ error: "Unsupported image type" });
      return;
    }

    const inputPath = preferWebpSibling(abs);
    const cacheDir = path.join(config.uploadsDir, ".img-cache");
    fs.mkdirSync(cacheDir, { recursive: true });

    const key = createHash("sha1")
      .update(`${inputPath}|${width}|${quality}|v1`)
      .digest("hex");
    const outPath = path.join(cacheDir, `${key}.webp`);

    if (!fs.existsSync(outPath)) {
      await sharp(inputPath, { failOn: "none" })
        .rotate()
        .resize(width, null, { withoutEnlargement: true, fit: "inside" })
        .webp({ quality, effort: 4 })
        .toFile(outPath);
    }

    res.setHeader("Content-Type", "image/webp");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Vary", "Accept");
    res.sendFile(outPath);
  } catch (err) {
    console.error("img resize error:", err?.message || err);
    res.status(500).json({ error: "Image processing failed" });
  }
}
