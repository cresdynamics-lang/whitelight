import { config } from "./config.js";
import {
  buildProductVisionPrompt,
  normalizeVisionResult,
  parseVisionJson,
} from "./productVisionPrompt.js";
import { loadImageForVision } from "./productVisionUtils.js";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function isGeminiConfigured() {
  return Boolean(config.gemini.apiKey);
}

export async function analyzeWithGemini(params) {
  if (!config.gemini.apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const { base64, mime } = await loadImageForVision(params.imageUrl);
  const prompt = buildProductVisionPrompt(params);
  const model = config.gemini.visionModel;
  const url = `${GEMINI_BASE}/models/${model}:generateContent?key=${encodeURIComponent(config.gemini.apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mime, data: base64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.55,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      body?.error?.message ||
      body?.error?.status ||
      JSON.stringify(body?.error || body).slice(0, 200) ||
      `Gemini API error ${res.status}`;
    throw new Error(msg);
  }

  const parts = body?.candidates?.[0]?.content?.parts || [];
  const content = parts.map((p) => p.text || "").join("").trim();
  if (!content) throw new Error("Empty response from Gemini vision model");

  const parsed = parseVisionJson(content);
  return normalizeVisionResult(parsed, "gemini", model);
}
