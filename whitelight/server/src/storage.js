import fs from "node:fs/promises";
import path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { config, useSpaces } from "./config.js";

const MAX_WIDTH = 900;
const JPEG_QUALITY = 70;
const WEBP_QUALITY = 68;

let s3 = null;
function getS3() {
  if (!useSpaces()) return null;
  if (!s3) {
    s3 = new S3Client({
      region: config.spaces.region,
      endpoint: config.spaces.endpoint,
      forcePathStyle: false,
      credentials: {
        accessKeyId: config.spaces.key,
        secretAccessKey: config.spaces.secret,
      },
    });
  }
  return s3;
}

/** Resize + compress buffer; return jpeg/png body + webp sibling. */
async function optimizeImage(buffer, preferredExt = ".jpg") {
  const img = sharp(buffer, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  let pipeline = img;
  if ((meta.width || 0) > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  const wantPng = preferredExt === ".png" || (meta.hasAlpha && preferredExt !== ".jpg");
  const mainExt = wantPng ? ".png" : preferredExt === ".jpeg" ? ".jpeg" : ".jpg";
  const mainBuf = wantPng
    ? await pipeline.clone().png({ compressionLevel: 9, palette: true, quality: 70 }).toBuffer()
    : await pipeline.clone().jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  const webpBuf = await pipeline.clone().webp({ quality: WEBP_QUALITY, effort: 5 }).toBuffer();
  const contentType = wantPng ? "image/png" : "image/jpeg";
  return { mainBuf, webpBuf, mainExt, contentType };
}

async function putLocal(dir, fileName, body, webpBody) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, fileName), body);
  const webpName = fileName.replace(/\.(jpe?g|png)$/i, ".webp");
  if (webpName !== fileName) {
    await fs.writeFile(path.join(dir, webpName), webpBody);
  }
}

export async function storeUpload(file) {
  const rawExt = (path.extname(file.originalname || "") || ".jpg").toLowerCase();
  const { mainBuf, webpBuf, mainExt, contentType } = await optimizeImage(file.buffer, rawExt);
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${mainExt}`;
  const key = `products/uploads/${fileName}`;

  const client = getS3();
  if (client) {
    await client.send(
      new PutObjectCommand({
        Bucket: config.spaces.bucket,
        Key: key,
        Body: mainBuf,
        ContentType: contentType,
        ACL: "public-read",
      })
    );
    const webpKey = key.replace(/\.(jpe?g|png)$/i, ".webp");
    await client.send(
      new PutObjectCommand({
        Bucket: config.spaces.bucket,
        Key: webpKey,
        Body: webpBuf,
        ContentType: "image/webp",
        ACL: "public-read",
      })
    );
    return `${config.spaces.cdnBase}/${key}`;
  }

  await putLocal(config.uploadsDir, fileName, mainBuf, webpBuf);
  return `${config.publicBaseUrl.replace(/\/$/, "")}/uploads/${fileName}`;
}

export async function uploadFromUrl(sourceUrl, productId, index = 0) {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Download failed ${res.status} for ${sourceUrl}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentTypeHint = res.headers.get("content-type") || "image/jpeg";
  const extHint =
    contentTypeHint.includes("png")
      ? ".png"
      : contentTypeHint.includes("webp")
        ? ".jpg"
        : contentTypeHint.includes("jpeg") || contentTypeHint.includes("jpg")
          ? ".jpg"
          : path.extname(new URL(sourceUrl).pathname) || ".jpg";

  const { mainBuf, webpBuf, mainExt, contentType } = await optimizeImage(buf, extHint);
  const fileName = `${index}-${Date.now()}${mainExt}`;
  const key = `products/${productId}/${fileName}`;

  const client = getS3();
  if (client) {
    await client.send(
      new PutObjectCommand({
        Bucket: config.spaces.bucket,
        Key: key,
        Body: mainBuf,
        ContentType: contentType,
        ACL: "public-read",
      })
    );
    const webpKey = key.replace(/\.(jpe?g|png)$/i, ".webp");
    await client.send(
      new PutObjectCommand({
        Bucket: config.spaces.bucket,
        Key: webpKey,
        Body: webpBuf,
        ContentType: "image/webp",
        ACL: "public-read",
      })
    );
    return `${config.spaces.cdnBase}/${key}`;
  }

  const dir = path.join(config.uploadsDir, String(productId));
  await putLocal(dir, fileName, mainBuf, webpBuf);
  return `${config.publicBaseUrl.replace(/\/$/, "")}/uploads/${productId}/${fileName}`;
}
