/**
 * Compress JPG/PNG in public/ and generate WebP for fast loading.
 * Run: npm run compress-images
 */
import sharp from "sharp";
import { readdirSync, renameSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public");

const DEFAULT_MAX = 1400;
const LOGO_MAX = 256;
const WEBP_QUALITY = 78;
const JPEG_QUALITY = 78;

function* walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}

function isImage(path) {
  const ext = extname(path).toLowerCase();
  return [".jpg", ".jpeg", ".png"].includes(ext);
}

function maxWidthFor(filePath) {
  const rel = filePath.replace(PUBLIC_DIR, "");
  if (rel.includes("whitelight_logo")) return LOGO_MAX;
  if (rel.includes("couresel_images") || rel.includes("guide_images")) return 1200;
  if (rel.match(/\.(jpe?g|png)$/i) && !rel.includes("/")) return 1280;
  return DEFAULT_MAX;
}

async function processFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  const base = filePath.slice(0, -ext.length);
  const webpPath = `${base}.webp`;
  const maxW = maxWidthFor(filePath);

  try {
    let pipeline = sharp(filePath);
    const meta = await pipeline.metadata();
    const width = meta.width || 0;
    if (width > maxW) {
      pipeline = pipeline.resize(maxW, null, { withoutEnlargement: true });
    }

    await pipeline
      .clone()
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(webpPath);

    const before = statSync(filePath).size;
    const tmpPath = `${filePath}.tmp.${randomBytes(4).toString("hex")}`;
    if (ext === ".png") {
      await pipeline.png({ compressionLevel: 9, effort: 4 }).toFile(tmpPath);
    } else {
      await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(tmpPath);
    }
    renameSync(tmpPath, filePath);
    const after = statSync(filePath).size;
    const webpSize = statSync(webpPath).size;
    console.log(
      `  ${filePath.replace(PUBLIC_DIR, "")} → ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB, webp ${Math.round(webpSize / 1024)}KB`
    );
  } catch (err) {
    console.error("  Error:", filePath, err.message);
  }
}

async function main() {
  console.log("Compressing images in", PUBLIC_DIR, "\n");
  const files = [...walk(PUBLIC_DIR)].filter(isImage);
  console.log(`Found ${files.length} images.\n`);

  for (const f of files) {
    await processFile(f);
  }
  console.log("\nDone.");
}

main();
