import { analyzeWithGroq, isGroqConfigured } from "./groq.js";
import { analyzeWithGemini, isGeminiConfigured } from "./gemini.js";

export { isGroqConfigured, isGeminiConfigured };
export { resolveUploadFile } from "./productVisionUtils.js";

export function isVisionAiConfigured() {
  return isGroqConfigured() || isGeminiConfigured();
}

/**
 * Analyze product image — Groq primary, Gemini fallback.
 */
export async function analyzeProductImage(params) {
  if (!isVisionAiConfigured()) {
    throw new Error("No vision AI configured (set GROQ_API_KEY or GEMINI_API_KEY)");
  }

  const errors = [];

  if (isGroqConfigured()) {
    try {
      return await analyzeWithGroq(params);
    } catch (err) {
      errors.push(`Groq: ${err?.message || err}`);
      console.warn("Groq vision failed, trying Gemini fallback:", err?.message || err);
    }
  }

  if (isGeminiConfigured()) {
    try {
      return await analyzeWithGemini(params);
    } catch (err) {
      errors.push(`Gemini: ${err?.message || err}`);
    }
  }

  throw new Error(errors.join(" | ") || "Vision analysis failed");
}
