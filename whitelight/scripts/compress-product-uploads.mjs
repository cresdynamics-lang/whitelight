/**
 * Compress product upload trees + sibling WebP (same basename for OptimizedImage).
 * Keeps original filenames so DB URLs stay valid.
 * Run: node scripts/compress-product-uploads.mjs [dir]
 */
import sharp from "sharp";
import { readdirSync, renameSync, statSync, existsSync, unlinkSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { randomBytes } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const targetDir =
  process.argv[2] || join(__dirname, "migrate-to-do", "export", "images");

const MAX_WIDTH = 900;
const WEBP_QUALITY = 68;
const JPEG_QUALITY = 70;

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}

function isRaster(path) {
  const ext = extname(path).toLowerCase();
  return [".jpg", ".jpeg", ".png"].includes(ext);
}

async function processFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  const base = filePath.slice(0, -ext.length);
  const webpPath = `${base}.webp`;
  const before = statSync(filePath).size;
  const tmpPath = `${filePath}.tmp.${randomBytes(4).toString("hex")}`;

  const input = sharp(filePath, { failOn: "none" }).rotate();
  const meta = await input.metadata();
  let pipeline = input;
  if ((meta.width || 0) > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  await pipeline
    .clone()
    .webp({ quality: WEBP_QUALITY, effort: 5 })
    .toFile(webpPath);

  if (ext === ".png") {
    await pipeline
      .clone()
      .png({ compressionLevel: 9, palette: true, quality: 70, effort: 7 })
      .toFile(tmpPath);
  } else {
    await pipeline
      .clone()
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(tmpPath);
  }

  renameSync(tmpPath, filePath);
  const after = statSync(filePath).size;
  const webpSize = statSync(webpPath).size;
  // Prefer the smaller of original re-encode vs webp for disk; always keep both for <picture>
  return { before, after, webpSize, path: filePath };
}

async function main() {
  if (!existsSync(targetDir)) {
    console.error("Missing dir:", targetDir);
    process.exit(1);
  }
  // Skip existing .webp when walking rasters
  const files = [...walk(targetDir)].filter(isRaster);
  console.log(`Compressing ${files.length} images in ${targetDir}`);
  let beforeTotal = 0;
  let afterTotal = 0;
  let webpTotal = 0;
  for (const f of files) {
    try {
      // remove prior webp so we regenerate fresh
      const webp = f.replace(/\.(jpe?g|png)$/i, ".webp");
      if (existsSync(webp) && webp !== f) {
        try {
          unlinkSync(webp);
        } catch {
          /* ignore */
        }
      }
      const r = await processFile(f);
      beforeTotal += r.before;
      afterTotal += r.after;
      webpTotal += r.webpSize;
      console.log(
        `  ${r.path.replace(targetDir, "")} ${Math.round(r.before / 1024)}→${Math.round(r.after / 1024)}KB webp ${Math.round(r.webpSize / 1024)}KB`
      );
    } catch (err) {
      console.error("  FAIL", f, err.message);
    }
  }
  console.log(
    `\nTotals: ${Math.round(beforeTotal / 1024)}KB → ${Math.round(afterTotal / 1024)}KB originals, +${Math.round(webpTotal / 1024)}KB webp`
  );
}

main();
