import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const exportDir = path.join(__dirname, "export");
const imagesDir = path.join(exportDir, "images");
dotenv.config({ path: path.resolve(__dirname, "../../.env.do") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function loadJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return fallback;
  }
}

function sanitizeName(url, productId, index) {
  try {
    const pathname = new URL(url).pathname;
    const base = path.basename(pathname) || `img-${index}.jpg`;
    return `${productId}/${index}-${base.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  } catch {
    return `${productId}/${index}.jpg`;
  }
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

async function main() {
  const manifest = await loadJson(path.join(exportDir, "manifest.json"), null);
  if (!manifest?.products) throw new Error("Run export first (missing manifest.json)");

  const urlMapPath = path.join(exportDir, "url-map.json");
  const urlMap = await loadJson(urlMapPath, {});
  const publicBase =
    process.env.PUBLIC_BASE_URL ||
    process.env.SPACES_CDN_BASE ||
    "http://64.227.13.96";

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of manifest.products) {
    const images = product.product_images || [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const oldUrl = img.url;
      if (!oldUrl) continue;
      if (urlMap[oldUrl]?.newUrl) {
        skipped++;
        continue;
      }
      const rel = sanitizeName(oldUrl, product.id, i);
      const dest = path.join(imagesDir, rel);
      try {
        // Keep existing Spaces URLs if they already point at our CDN
        if (
          process.env.SPACES_CDN_BASE &&
          oldUrl.includes(process.env.SPACES_CDN_BASE.replace(/^https?:\/\//, ""))
        ) {
          urlMap[oldUrl] = { newUrl: oldUrl, kept: true };
          skipped++;
          continue;
        }
        await download(oldUrl, dest);
        const newUrl = `${publicBase.replace(/\/$/, "")}/uploads/${rel}`;
        urlMap[oldUrl] = { newUrl, localPath: dest, productId: product.id };
        done++;
        console.log(`OK ${product.id} ${i + 1}/${images.length}`);
      } catch (e) {
        failed++;
        urlMap[oldUrl] = { error: String(e.message || e), productId: product.id };
        console.warn(`FAIL ${oldUrl}: ${e.message}`);
      }
      await fs.writeFile(urlMapPath, JSON.stringify(urlMap, null, 2));
    }
  }

  console.log(JSON.stringify({ done, skipped, failed, map: urlMapPath }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
