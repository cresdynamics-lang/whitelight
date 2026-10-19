/**
 * Quality-preserving recompress of product uploads.
 * - Caps long edge, writes WebP siblings for JPG/PNG
 * - Recompresses oversized WebP in place
 * - Keeps filenames so DB URLs stay valid
 *
 * Run: node scripts/compress-product-uploads.mjs [dir]
 * Contabo: node scripts/compress-product-uploads.mjs /var/www/sites/whitelightstore.co.ke/uploads
 */
import sharp from "sharp";
import {
  readdirSync,
  renameSync,
  statSync,
  existsSync,
  unlinkSync,
  mkdirSync,
} from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const targetDir =
  process.argv[2] || join(__dirname, "migrate-to-do", "export", "images");

/** Display masters — sharp enough for PDP, small enough for mobile */
const MAX_WIDTH = 1400;
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 84;
/** Skip re-encode when already small enough (bytes) and under max width */
const SKIP_BYTES = 180 * 1024;
const SKIP_WEBP_BYTES = 120 * 1024;

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".img-cache" || e.name.startsWith(".")) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}

function isRaster(path) {
  const ext = extname(path).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
}

async function processFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  const before = statSync(filePath).size;
  const tmpPath = `${filePath}.tmp.${randomBytes(4).toString("hex")}`;

  const input = sharp(filePath, { failOn: "none", animated: false }).rotate();
  const meta = await input.metadata();
  const width = meta.width || 0;
  const needsResize = width > MAX_WIDTH;
  const skipThreshold = ext === ".webp" ? SKIP_WEBP_BYTES : SKIP_BYTES;

  if (!needsResize && before <= skipThreshold) {
    // Still ensure WebP sibling exists for jpg/png
    if (ext !== ".webp") {
      const webpPath = filePath.replace(/\.(jpe?g|png)$/i, ".webp");
      if (!existsSync(webpPath)) {
        let pipeline = sharp(filePath, { failOn: "none" }).rotate();
        await pipeline.webp({ quality: WEBP_QUALITY, effort: 6 }).toFile(webpPath);
        return {
          before,
          after: before,
          webpSize: statSync(webpPath).size,
          path: filePath,
          skipped: false,
          note: "webp-only",
        };
      }
    }
    return { before, after: before, webpSize: 0, path: filePath, skipped: true };
  }

  let pipeline = input;
  if (needsResize) {
    pipeline = pipeline.resize(MAX_WIDTH, null, {
      withoutEnlargement: true,
      fit: "inside",
    });
  }

  if (ext === ".webp") {
    await pipeline
      .webp({ quality: WEBP_QUALITY, effort: 6 })
      .toFile(tmpPath);
    renameSync(tmpPath, filePath);
    const after = statSync(filePath).size;
    return { before, after, webpSize: after, path: filePath, skipped: false };
  }

  const webpPath = filePath.replace(/\.(jpe?g|png)$/i, ".webp");
  await pipeline
    .clone()
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(webpPath);

  if (ext === ".png") {
    // Prefer JPEG for photos without useful alpha — much smaller, same look
    const hasAlpha = Boolean(meta.hasAlpha);
    if (hasAlpha) {
      await pipeline
        .clone()
        .png({ compressionLevel: 9, effort: 7, palette: false })
        .toFile(tmpPath);
    } else {
      await pipeline
        .clone()
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: "4:4:4" })
        .toFile(tmpPath);
      // Keep .png filename but JPEG bytes would break — write as jpeg only if we rename.
      // Safer: keep PNG compressed without palette (preserves quality).
      unlinkSync(tmpPath);
      await pipeline
        .clone()
        .png({ compressionLevel: 9, effort: 8 })
        .toFile(tmpPath);
    }
  } else {
    await pipeline
      .clone()
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, chromaSubsampling: "4:4:4" })
      .toFile(tmpPath);
  }

  renameSync(tmpPath, filePath);
  const after = statSync(filePath).size;
  const webpSize = existsSync(webpPath) ? statSync(webpPath).size : 0;
  return { before, after, webpSize, path: filePath, skipped: false };
}

async function main() {
  if (!existsSync(targetDir)) {
    console.error("Missing dir:", targetDir);
    process.exit(1);
  }

  const cacheDir = join(targetDir, ".img-cache");
  if (existsSync(cacheDir)) {
    // Bust resize cache so /api/img regenerates from new masters
    for (const f of readdirSync(cacheDir)) {
      try {
        unlinkSync(join(cacheDir, f));
      } catch {
        /* ignore */
      }
    }
    console.log("Cleared .img-cache");
  } else {
    mkdirSync(cacheDir, { recursive: true });
  }

  const files = [...walk(targetDir)].filter(isRaster);
  console.log(`Scanning ${files.length} images in ${targetDir}`);
  console.log(
    `Settings: max ${MAX_WIDTH}px · WebP q${WEBP_QUALITY} · JPEG q${JPEG_QUALITY} (mozjpeg 4:4:4)\n`
  );

  let beforeTotal = 0;
  let afterTotal = 0;
  let webpTotal = 0;
  let skipped = 0;
  let processed = 0;

  for (const f of files) {
    try {
      const r = await processFile(f);
      beforeTotal += r.before;
      afterTotal += r.after;
      webpTotal += r.webpSize || 0;
      if (r.skipped) {
        skipped += 1;
        continue;
      }
      processed += 1;
      const rel = f.replace(targetDir, "");
      console.log(
        `  ${rel} ${Math.round(r.before / 1024)}→${Math.round(r.after / 1024)}KB` +
          (r.webpSize ? ` webp ${Math.round(r.webpSize / 1024)}KB` : "") +
          (r.note ? ` (${r.note})` : "")
      );
    } catch (err) {
      console.error("  FAIL", f, err.message);
      try {
        unlinkSync(`${f}.tmp`);
      } catch {
        /* ignore */
      }
    }
  }

  console.log(
    `\nDone. processed=${processed} skipped=${skipped}` +
      `\nMasters: ${Math.round(beforeTotal / 1024)}KB → ${Math.round(afterTotal / 1024)}KB` +
      `\nWebP written/updated: ~${Math.round(webpTotal / 1024)}KB`
  );
}

main();
