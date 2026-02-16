/**
 * Compress all JPG/PNG in public/ and generate WebP versions for fast loading.
 * Run: node scripts/compress-images.mjs
 */
import sharp from 'sharp';
import { readdirSync, renameSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 82;
const PNG_EFFORT = 6;

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
  return ['.jpg', '.jpeg', '.png'].includes(ext);
}

async function processFile(filePath) {
  const ext = extname(filePath).toLowerCase();
  const base = filePath.slice(0, -ext.length);
  const webpPath = `${base}.webp`;

  try {
    let pipeline = sharp(filePath);
    const meta = await pipeline.metadata();
    const width = meta.width || 0;
    const needResize = width > MAX_WIDTH;

    if (needResize) {
      pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
    }

    // Write WebP (smaller, fast)
    await pipeline
      .clone()
      .webp({ quality: WEBP_QUALITY, effort: PNG_EFFORT })
      .toFile(webpPath);
    console.log('  WebP:', webpPath.replace(PUBLIC_DIR, ''));

    // Write compressed original to temp file in same dir then replace (sharp disallows same in/out)
    const tmpPath = `${filePath}.tmp.${randomBytes(4).toString('hex')}`;
    if (ext === '.png') {
      await pipeline
        .png({ compressionLevel: 9, effort: PNG_EFFORT })
        .toFile(tmpPath);
    } else {
      await pipeline
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toFile(tmpPath);
    }
    renameSync(tmpPath, filePath);
    console.log('  Compressed:', filePath.replace(PUBLIC_DIR, ''));
  } catch (err) {
    console.error('  Error:', filePath, err.message);
  }
}

async function main() {
  console.log('Compressing images in', PUBLIC_DIR, '\n');
  const files = [...walk(PUBLIC_DIR)].filter(isImage);
  console.log(`Found ${files.length} images.\n`);

  for (const f of files) {
    console.log(f.replace(PUBLIC_DIR, ''));
    await processFile(f);
  }
  console.log('\nDone.');
}

main();
