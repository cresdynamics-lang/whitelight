#!/usr/bin/env node
/**
 * Test Groq vision on a local or server upload path.
 * Usage: GROQ_API_KEY=gsk_... node scripts/test-groq-vision.mjs /path/to/image.jpg
 */
import { readFileSync, existsSync } from "fs";
import { extname, basename } from "path";

const key = process.env.GROQ_API_KEY;
const imagePath = process.argv[2];
const model = process.env.GROQ_VISION_MODEL || "qwen/qwen3.6-27b";

if (!key) {
  console.error("Set GROQ_API_KEY");
  process.exit(1);
}
if (!imagePath || !existsSync(imagePath)) {
  console.error("Usage: GROQ_API_KEY=... node scripts/test-groq-vision.mjs <image-file>");
  process.exit(1);
}

const ext = extname(imagePath).toLowerCase();
const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
const b64 = readFileSync(imagePath).toString("base64");

const prompt = `Analyze this athletic footwear product image for Whitelight Store Nairobi.
Return JSON only: {"description":"SEO copy for Nairobi shoppers with sizes 40,41,42","altText":"...","suggestedTags":["..."],"suggestedName":"","suggestedBrand":""}`;

const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model,
    temperature: 0.4,
    max_completion_tokens: 900,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
        ],
      },
    ],
  }),
});

const body = await res.json();
if (!res.ok) {
  console.error("Groq error:", body?.error || body);
  process.exit(1);
}

const text = body?.choices?.[0]?.message?.content;
console.log("Model:", model);
console.log("Image:", basename(imagePath));
console.log("---");
console.log(text);
