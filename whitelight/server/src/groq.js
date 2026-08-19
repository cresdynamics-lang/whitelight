import { config } from "./config.js";
import {
  buildProductVisionPrompt,
  normalizeVisionResult,
  parseVisionJson,
} from "./productVisionPrompt.js";
import { loadImageForVision } from "./productVisionUtils.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MAX_ATTEMPTS = 3;
const MAX_RETRY_WAIT_MS = 45_000;

export function isGroqConfigured() {
  return Boolean(config.groq.apiKey);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Groq returns "Please try again in 41.7s" — respect it when it is short enough. */
function retryDelayFromMessage(message) {
  const match = /try again in ([\d.]+)s/i.exec(String(message || ""));
  if (!match) return 5000;
  return Math.min(Math.ceil(Number(match[1]) * 1000) + 750, MAX_RETRY_WAIT_MS);
}

function isRateLimit(status, message) {
  return status === 429 || /rate limit|tokens per minute|\bTPM\b/i.test(String(message || ""));
}

/**
 * Groq bills the whole org against one shared per-minute token budget, so two
 * parallel analyses knock each other out. Run them one at a time instead.
 */
let queue = Promise.resolve();
function enqueue(task) {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

async function callGroq(body) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.groq.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

export function analyzeWithGroq(params) {
  return enqueue(() => runGroqAnalysis(params));
}

async function runGroqAnalysis(params) {
  if (!config.groq.apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const { dataUrl } = await loadImageForVision(params.imageUrl);
  const prompt = buildProductVisionPrompt(params);

  const baseBody = {
    model: config.groq.visionModel,
    temperature: 0.45,
    // Groq reserves this against the per-minute budget, so keep it just above
    // what a ~450 word description plus JSON wrapper actually needs.
    max_completion_tokens: 1300,
    // Qwen ships a thinking mode that emits <think> blocks and eats the token budget.
    reasoning_effort: "none",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  };

  let lastError;
  let allowReasoningParam = true;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const body = { ...baseBody };
    if (!allowReasoningParam) delete body.reasoning_effort;

    const { res, json } = await callGroq(body);

    if (!res.ok) {
      const msg = json?.error?.message || json?.error || `Groq API error ${res.status}`;
      lastError = new Error(msg);

      if (res.status === 400 && /reasoning_effort/i.test(String(msg))) {
        allowReasoningParam = false;
        continue;
      }
      if (isRateLimit(res.status, msg) && attempt < MAX_ATTEMPTS) {
        const wait = retryDelayFromMessage(msg);
        console.warn(`Groq rate limited (attempt ${attempt}), retrying in ${wait}ms`);
        await sleep(wait);
        continue;
      }
      throw lastError;
    }

    if (json?.usage) {
      console.log(
        `Groq vision usage: prompt=${json.usage.prompt_tokens} completion=${json.usage.completion_tokens}`
      );
    }

    const content = json?.choices?.[0]?.message?.content;
    if (!content) {
      lastError = new Error("Empty response from Groq vision model");
      if (attempt < MAX_ATTEMPTS) continue;
      throw lastError;
    }

    try {
      const parsed = parseVisionJson(content);
      return normalizeVisionResult(parsed, "groq", config.groq.visionModel);
    } catch (err) {
      lastError = new Error(`Groq returned unparseable output: ${err.message}`);
      if (attempt < MAX_ATTEMPTS) continue;
      throw lastError;
    }
  }

  throw lastError || new Error("Groq vision failed");
}
