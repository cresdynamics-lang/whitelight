/** Shared vision prompt — describe the shoe itself: feel, materials, use. No location SEO. */

const CATEGORY_GUIDANCE = {
  running: `CATEGORY: RUNNING
Focus the description on running use:
- Cushioning feel (spongy, soft, firm, responsive — say what you see/infer)
- How it rides for easy miles, morning runs, and longer efforts (speak in km ranges when sensible, e.g. daily 5–15 km)
- Energy return, breathability, and outsole grip for road / paved surfaces
- Who it suits: easy days, tempo, long runs — based on the shoe you see`,

  gym: `CATEGORY: GYM
Focus on gym / training use:
- Stability underfoot for lifts, lunges, and machines
- Lateral support for HIIT and side-to-side moves
- How firm or spongy the midsole feels for gym floors
- Breathability and durability through hard sessions
- Whether it can double for light runs or stays best as a gym shoe`,

  trail: `CATEGORY: TRAIL
Focus on trail use:
- Lug pattern and grip for dirt, mud, and uneven ground
- Protection (toe bumper, rock feel) and upper toughness
- Cushioning on trails vs road shoes
- Best for trail runs, mixed terrain, weekend miles — estimate sensible km use if clear
- Say clearly it is built for trail (and whether gym/road is secondary)`,

  training: `CATEGORY: TRAINING
Focus on all-round training:
- Balance of cushion and ground feel for drills, circuits, and gym work
- Multi-direction support
- Whether it works for short runs, gym days, or both
- Comfort over a full training session`,

  basketball: `CATEGORY: BASKETBALL
Focus on court performance:
- Lockdown, ankle feel (high/low), and cushioning on landings
- Lateral grip and cut support
- Court traction and durability
- Comfort through a full game or practice`,

  tennis: `CATEGORY: TENNIS
Focus on court movement:
- Side-to-side stability and first-step feel
- Toe durability and outsole grip
- Cushioning for hard sessions
- Comfort across matches and practice`,

  accessories: `CATEGORY: ACCESSORIES
Describe the item itself:
- What it is made of and how it feels
- What it is for (socks, bag, cap, etc.)
- Why the materials and construction matter
- Do not invent shoe performance claims`,
};

function normalizeCategory(category) {
  const c = String(category || "running").toLowerCase().trim();
  if (c in CATEGORY_GUIDANCE) return c;
  if (c.includes("run")) return "running";
  if (c.includes("gym") || c.includes("jim")) return "gym";
  if (c.includes("trail")) return "trail";
  if (c.includes("train")) return "training";
  if (c.includes("basket")) return "basketball";
  if (c.includes("tennis")) return "tennis";
  if (c.includes("accessor")) return "accessories";
  return "running";
}

function formatSizes(sizes) {
  if (!Array.isArray(sizes) || sizes.length === 0) {
    return "Sizes: not selected yet — do not invent size numbers.";
  }
  return `Available sizes (mention once near the end if relevant): ${sizes.map((s) => String(s)).join(", ")}.`;
}

export function buildProductVisionPrompt({ name, brand, category, sizes }) {
  const cat = normalizeCategory(category);
  const categoryBlock = CATEGORY_GUIDANCE[cat];
  const sizeLine = formatSizes(sizes);

  return `You are a product specialist writing shoe (or accessory) descriptions from a product photo.

TASK: Look carefully at the image. Describe THIS product only — how it feels, what it is made of, how it performs, and what it is for.

${categoryBlock}

${sizeLine}

ADMIN HINTS (use if they match the image; the image is the source of truth):
- Name hint: "${name || ""}"
- Brand hint: "${brand || ""}"
- Category: ${cat}

HARD RULES — FOLLOW EXACTLY:
1. Start the description with the shoe/product name (brand + model if you can see it), then describe the shoe.
2. Describe the shoe itself:
   - Comfort (e.g. spongy, plush, firm, soft underfoot)
   - Materials (mesh, knit, leather, rubber outsole, foam midsole — only what you can see or reasonably infer)
   - Performance (cushioning, bounce, stability, grip, breathability)
   - What it is used for (running, gym, trail, training, court — be specific from category + image)
   - Where it is best used (e.g. morning run, daily training, gym floor, trail paths)
   - Sensible distance language when it fits (e.g. easy 5–10 km runs, longer weekend miles) — do not invent race medals or fake specs
3. DO NOT mention: Nairobi, Kenya, Luthuli, CBD, WhatsApp, delivery, Whitelight store location, SEO keyword stuffing, "buy now", or city marketing.
4. DO NOT write a travelogue or store pitch. Just describe the shoe.
5. Write 4–6 clear paragraphs (about 280–450 words). Separate paragraphs with \\n\\n inside the JSON string.
6. Flowing prose only — no bullet lists in the description.
7. If brand/model is unclear, open with a honest short name from what you see, then describe materials and feel.
8. Tags should be short product tags (brand, model cues, use: running/gym/trail, foam/mesh, etc.) — not location SEO.
9. CRITICAL JSON: Return ONE JSON object only. Description must be one string; use \\n\\n for paragraph breaks. Escape inner double quotes.

Return ONLY valid JSON (no markdown fences):
{
  "description": "Name of the shoe.\\n\\nThen comfort, materials, performance, and use...",
  "altText": "short image alt under 125 characters",
  "suggestedTags": ["8-12 short product tags"],
  "suggestedName": "product name if identifiable else empty string",
  "suggestedBrand": "brand if identifiable else empty string"
}`;
}

/** Recover the fields even when the model truncates or breaks strict JSON. */
function salvageFields(text) {
  const pick = (key) => {
    const m = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(text);
    return m ? m[1] : "";
  };
  const description = pick("description");
  if (!description) return null;

  const tagsMatch = /"suggestedTags"\s*:\s*\[([\s\S]*?)\]/.exec(text);
  const suggestedTags = tagsMatch
    ? tagsMatch[1]
        .split(",")
        .map((t) => t.trim().replace(/^"|"$/g, "").trim())
        .filter(Boolean)
    : [];

  return {
    description,
    altText: pick("altText"),
    suggestedTags,
    suggestedName: pick("suggestedName"),
    suggestedBrand: pick("suggestedBrand"),
  };
}

export function parseVisionJson(text) {
  let raw = String(text || "")
    // Reasoning models can prefix a <think>…</think> block before the JSON.
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/i, "")
    .trim();

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) raw = fenced[1].trim();

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const candidate = start !== -1 && end > start ? raw.slice(start, end + 1) : raw;

  try {
    return JSON.parse(candidate);
  } catch {
    /* fall through to repairs */
  }

  try {
    const fixed = candidate.replace(
      /"description"\s*:\s*"([\s\S]*?)"\s*,\s*"altText"/,
      (_, desc) =>
        `"description": ${JSON.stringify(desc.replace(/\r?\n/g, "\\n"))}, "altText"`
    );
    return JSON.parse(fixed);
  } catch {
    /* fall through to salvage */
  }

  const salvaged = salvageFields(raw);
  if (salvaged) return salvaged;

  throw new Error("Model did not return valid JSON");
}

function unescapeDescription(text) {
  return String(text || "")
    .replace(/\\n/g, "\n")
    .trim();
}

export function normalizeVisionResult(parsed, provider, model) {
  return {
    description: unescapeDescription(parsed.description),
    altText: String(parsed.altText || "").trim(),
    suggestedTags: Array.isArray(parsed.suggestedTags)
      ? parsed.suggestedTags.map((t) => String(t).trim()).filter(Boolean)
      : [],
    suggestedName: String(parsed.suggestedName || "").trim(),
    suggestedBrand: String(parsed.suggestedBrand || "").trim(),
    provider,
    model,
  };
}
