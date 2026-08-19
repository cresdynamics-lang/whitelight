import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env.do") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  host: process.env.HOST || "127.0.0.1",
  port: Number(process.env.PORT || 8080),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.ADMIN_JWT_SECRET || "dev-change-me",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${process.env.PORT || 8080}`,
  uploadsDir: process.env.UPLOADS_DIR || path.resolve(__dirname, "../../uploads"),
  spaces: {
    endpoint: process.env.SPACES_ENDPOINT || "",
    region: process.env.SPACES_REGION || "fra1",
    bucket: process.env.SPACES_BUCKET || "",
    key: process.env.SPACES_KEY || "",
    secret: process.env.SPACES_SECRET || "",
    cdnBase: (process.env.SPACES_CDN_BASE || "").replace(/\/$/, ""),
  },
  meta: {
    pixelId: process.env.META_PIXEL_ID || process.env.VITE_META_PIXEL_ID || "",
    accessToken: process.env.META_ACCESS_TOKEN || "",
  },
  pesapal: {
    consumerKey: process.env.PESAPAL_CONSUMER_KEY || "",
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || "",
    /** sandbox | live */
    env: (process.env.PESAPAL_ENV || "sandbox").toLowerCase() === "live" ? "live" : "sandbox",
    ipnId: process.env.PESAPAL_IPN_ID || "",
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    visionModel: process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b",
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || "",
    visionModel: process.env.GEMINI_VISION_MODEL || "gemini-2.0-flash",
  },
};

export function useSpaces() {
  const s = config.spaces;
  return Boolean(s.endpoint && s.bucket && s.key && s.secret && s.cdnBase);
}
