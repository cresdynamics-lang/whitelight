import type {
  FitNote,
  Product,
  ProductFeel,
  ProductHotspot,
  ProductImage,
  ProductPurpose,
} from "@/types/product";

const PURPOSE_BY_CATEGORY: Record<string, ProductPurpose> = {
  running: "daily",
  trail: "trail",
  gym: "gym",
  training: "gym",
  basketball: "court",
  tennis: "court",
  accessories: "gym",
};

const DEFAULT_FEEL: Record<string, ProductFeel> = {
  running: { cushion: 4, response: 3, grip: 3, stability: 3, weight: 3, durability: 4 },
  trail: { cushion: 3, response: 3, grip: 5, stability: 4, weight: 3, durability: 4 },
  gym: { cushion: 2, response: 3, grip: 4, stability: 5, weight: 3, durability: 4 },
  training: { cushion: 2, response: 3, grip: 4, stability: 5, weight: 3, durability: 4 },
  basketball: { cushion: 4, response: 4, grip: 4, stability: 4, weight: 3, durability: 3 },
  tennis: { cushion: 3, response: 3, grip: 4, stability: 4, weight: 3, durability: 4 },
  accessories: { cushion: 3, response: 3, grip: 3, stability: 3, weight: 3, durability: 3 },
};

export const PURPOSE_LABELS: Record<ProductPurpose, string> = {
  race_day: "Race day",
  daily: "Daily",
  long_run: "Long run",
  trail: "Trail",
  gym: "Gym",
  court: "Court",
};

export const FIT_NOTE_LABELS: Record<FitNote, string> = {
  true_to_size: "Fits true to size",
  half_up: "Consider half size up",
  runs_small: "Runs small",
  runs_large: "Runs large",
};

export function inferPurpose(product: Pick<Product, "category" | "tags" | "purpose">): ProductPurpose {
  if (product.purpose) return product.purpose;
  const tags = (product.tags || []).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes("race") || t.includes("tempo") || t.includes("carbon"))) {
    return "race_day";
  }
  if (tags.some((t) => t.includes("marathon") || t.includes("long"))) return "long_run";
  return PURPOSE_BY_CATEGORY[product.category] || "daily";
}

export function inferFeel(product: Pick<Product, "category" | "feel">): ProductFeel {
  if (product.feel) return { ...DEFAULT_FEEL.running, ...product.feel };
  return { ...(DEFAULT_FEEL[product.category] || DEFAULT_FEEL.running) };
}

export function enrichProduct(product: Product): Product {
  const purpose = inferPurpose(product);
  const feel = inferFeel(product);
  const fitNote = product.fitNote || "true_to_size";
  const images = (product.images || []).map((img, i) => enrichImageAngle(img, i));
  const forWhom =
    product.forWhom ||
    defaultForWhom(product.category, purpose);
  const skipIf = product.skipIf || defaultSkipIf(purpose);

  return {
    ...product,
    purpose,
    feel,
    fitNote,
    forWhom,
    skipIf,
    hotspots: Array.isArray(product.hotspots) ? product.hotspots : [],
    images,
  };
}

function enrichImageAngle(img: ProductImage, index: number): ProductImage {
  if (img.angleRole) return img;
  const roles: NonNullable<ProductImage["angleRole"]>[] = [
    "side",
    "sole",
    "front",
    "detail",
    "heel",
  ];
  return { ...img, angleRole: roles[index] || "detail" };
}

function defaultForWhom(category: string, purpose: ProductPurpose): string {
  if (purpose === "race_day") {
    return "A light, quick shoe for tempo runs and race day — not every easy mile.";
  }
  if (purpose === "trail") {
    return "Built for grip on mud, roots and loose dirt around Karura and Ngong.";
  }
  if (purpose === "gym" || category === "training") {
    return "Stable under lifts and side-to-side HIIT, comfortable enough for the whole session.";
  }
  if (purpose === "court") {
    return "Court grip and cushioning for quick cuts and landings.";
  }
  return "A dependable daily trainer for Nairobi roads and everyday miles.";
}

function defaultSkipIf(purpose: ProductPurpose): string {
  if (purpose === "race_day") return "Skip it if you want one soft shoe for every easy mile.";
  if (purpose === "trail") return "Skip it if you only run on smooth CBD pavement.";
  if (purpose === "gym") return "Skip it if you mainly need a high-cushion road runner.";
  return "Skip it if you need deep trail lugs or a pure race plate.";
}

export function stockLeftCount(product: Product): number {
  const variants = product.variants || [];
  if (!variants.length) return 0;
  return variants.reduce((sum, v) => {
    if (!v.inStock) return sum;
    const qty = typeof v.stockQuantity === "number" ? v.stockQuantity : 1;
    return sum + Math.max(qty, 1);
  }, 0);
}

export function inStockSizes(product: Product): (number | string)[] {
  return (product.variants || [])
    .filter((v) => v.inStock)
    .map((v) => v.size);
}

export function hasSizeInStock(product: Product, size: number | string | null): boolean {
  if (size == null) return true;
  return (product.variants || []).some(
    (v) => v.inStock && String(v.size) === String(size)
  );
}

export function countProductsInSize(products: Product[], size: number | string | null): number {
  if (size == null) return products.length;
  return products.filter((p) => hasSizeInStock(p, size)).length;
}

export function filterByPreferredSize<T extends Product>(
  products: T[],
  size: number | string | null
): T[] {
  if (size == null) return products;
  return products.filter((p) => hasSizeInStock(p, size));
}

export type FindMyPairAnswers = {
  activity?: string;
  surface?: string;
  budget?: string;
  size?: number | string | null;
};

export function matchFindMyPair(products: Product[], answers: FindMyPairAnswers): Product[] {
  let list = products.map(enrichProduct);

  if (answers.activity === "trail") {
    list = list.filter((p) => p.category === "trail" || p.purpose === "trail");
  } else if (answers.activity === "gym") {
    list = list.filter((p) => p.category === "gym" || p.category === "training");
  } else if (answers.activity === "court") {
    list = list.filter((p) => p.category === "basketball" || p.category === "tennis");
  } else if (answers.activity === "running") {
    list = list.filter((p) => p.category === "running");
  }

  if (answers.surface === "mud" || answers.surface === "hills") {
    list = list.filter((p) => p.category === "trail" || (p.feel?.grip || 0) >= 4);
  }

  if (answers.budget === "under_6000") {
    list = list.filter((p) => p.price < 6000);
  } else if (answers.budget === "6000_7000") {
    list = list.filter((p) => p.price >= 6000 && p.price <= 7000);
  } else if (answers.budget === "7000_7500") {
    list = list.filter((p) => p.price > 7000 && p.price <= 7500);
  }

  if (answers.size != null) {
    list = filterByPreferredSize(list, answers.size);
  }

  return list.slice(0, 3);
}

export function matchReason(product: Product, answers: FindMyPairAnswers): string {
  const enriched = enrichProduct(product);
  const bits: string[] = [];
  if (answers.activity === "trail") bits.push("Grip for trail terrain");
  if (answers.activity === "gym") bits.push("Stable for gym work");
  if (answers.activity === "running") bits.push("Built for road running");
  if (answers.size != null) bits.push(`Size ${answers.size} in stock`);
  bits.push(PURPOSE_LABELS[enriched.purpose || "daily"]);
  return bits.join(" · ");
}

export function parseShoeSearchQuery(query: string): {
  text: string;
  size: number | null;
  categoryHint: string | null;
  purposeHint: ProductPurpose | null;
} {
  const raw = query.trim().toLowerCase();
  const sizeMatch = raw.match(/\b(3[5-9]|4[0-9]|5[0-2])\b/);
  const size = sizeMatch ? Number(sizeMatch[1]) : null;
  let categoryHint: string | null = null;
  let purposeHint: ProductPurpose | null = null;

  if (/\btrail\b/.test(raw)) categoryHint = "trail";
  else if (/\bgym|training|hiit|lift\b/.test(raw)) categoryHint = "gym";
  else if (/\bbasket|court|baller\b/.test(raw)) categoryHint = "basketball";
  else if (/\btennis\b/.test(raw)) categoryHint = "tennis";
  else if (/\brunn/.test(raw)) categoryHint = "running";

  if (/\brace|tempo|speed\b/.test(raw)) purposeHint = "race_day";
  else if (/\bwaterproof|gore\b/.test(raw)) purposeHint = "trail";
  else if (/\bdaily|trainer\b/.test(raw)) purposeHint = "daily";

  const text = raw
    .replace(/\b(3[5-9]|4[0-9]|5[0-2])\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { text, size, categoryHint, purposeHint };
}

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return [];
  const { text, size, categoryHint, purposeHint } = parseShoeSearchQuery(query);
  let list = products.map(enrichProduct);

  if (categoryHint) list = list.filter((p) => p.category === categoryHint);
  if (purposeHint) list = list.filter((p) => inferPurpose(p) === purposeHint);
  if (size != null) list = filterByPreferredSize(list, size);

  if (text) {
    const tokens = text.split(" ").filter(Boolean);
    list = list.filter((p) => {
      const hay = `${p.brand} ${p.name} ${p.category} ${(p.tags || []).join(" ")}`.toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }

  return list.slice(0, 12);
}

export function defaultHotspots(product: Product): ProductHotspot[] {
  if (product.hotspots?.length) return product.hotspots;
  return [
    {
      id: "midsole",
      label: "Midsole",
      body: "Cushioning and response tuned for how this pair is meant to be used.",
      x: 45,
      y: 55,
    },
    {
      id: "outsole",
      label: "Outsole",
      body:
        product.category === "trail"
          ? "Lug pattern for mud and loose dirt."
          : "Rubber pattern for road grip and durability.",
      x: 55,
      y: 78,
    },
  ];
}
