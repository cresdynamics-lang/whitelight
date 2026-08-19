import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { config } from "./config.js";

/** Vision models bill by image tokens — keep uploads small to stay inside rate limits. */
const VISION_MAX_WIDTH = Number(process.env.VISION_MAX_WIDTH || 640);
const VISION_QUALITY = Number(process.env.VISION_QUALITY || 70);

export function mimeFromExt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

/** Resolve /uploads/... to absolute path on disk */
export function resolveUploadFile(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  let src = imageUrl.trim();
  try {
    if (src.startsWith("http://") || src.startsWith("https://")) {
      const u = new URL(src);
      src = u.pathname;
    }
  } catch {
    return null;
  }
  if (!src.startsWith("/uploads/")) return null;
  const rel = src.slice("/uploads/".length);
  if (!rel || rel.includes("..")) return null;
  const abs = path.resolve(config.uploadsDir, rel);
  const root = path.resolve(config.uploadsDir);
  if (!abs.startsWith(root + path.sep) && abs !== root) return null;
  return fs.existsSync(abs) ? abs : null;
}

/**
 * Read + downscale an upload for vision models.
 * Smaller payload = far fewer image tokens, which keeps Groq under its TPM limit.
 */
export async function loadImageForVision(imageUrl) {
  const filePath = resolveUploadFile(imageUrl);
  if (!filePath) {
    throw new Error("Image not found on server. Upload the image first.");
  }
  const stat = fs.statSync(filePath);
  if (stat.size > 25 * 1024 * 1024) {
    throw new Error("Image too large for AI analysis (max 25MB)");
  }

  let buf;
  let mime = "image/webp";
  try {
    buf = await sharp(filePath, { failOn: "none" })
      .rotate()
      .resize(VISION_MAX_WIDTH, null, { withoutEnlargement: true, fit: "inside" })
      .webp({ quality: VISION_QUALITY, effort: 4 })
      .toBuffer();
  } catch {
    buf = fs.readFileSync(filePath);
    mime = mimeFromExt(filePath);
  }

  const base64 = buf.toString("base64");
  return {
    filePath,
    mime,
    bytes: buf.length,
    base64,
    dataUrl: `data:${mime};base64,${base64}`,
  };
}
