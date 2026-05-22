import { Product } from "@/types/product";

const BASE_URL = "https://whitelightstore.co.ke";

/**
 * Generate SEO-optimized title for a product
 * Format: "Product Name — Brand Category | White Light Store Kenya"
 */
export function generateProductTitle(product: Product): string {
  const categoryName = getCategoryDisplayName(product.category);
  return `${product.name} — ${product.brand} ${categoryName} Nairobi | Whitelight Store`;
}

/**
 * Generate SEO-optimized description for a product
 */
export function generateProductDescription(product: Product): string {
  const availableSizes = product.variants
    .filter((v) => v.inStock)
    .map((v) => v.size)
    .join(", ");

  const priceText =
    product.originalPrice && product.originalPrice > product.price
      ? `Now KES ${product.price.toLocaleString()} (was KES ${product.originalPrice.toLocaleString()})`
      : `KES ${product.price.toLocaleString()}`;

  const categoryName = getCategoryDisplayName(product.category);
  const shortDesc = product.description.substring(0, 100).trimEnd();

  return `Buy ${product.name} by ${product.brand} in Nairobi. ${shortDesc}... Sizes: ${availableSizes || "check availability"}. ${priceText}. Same-day Nairobi CBD delivery from Whitelight Store — trusted for the best ${categoryName.toLowerCase()} in Nairobi, Luthuli Avenue.`;
}

/**
 * Generate SEO keywords for a product
 * FIX: removed "cheap" — undermines premium brand positioning
 */
export function generateProductKeywords(product: Product): string {
  const categoryName = getCategoryDisplayName(product.category);

  const keywords = [
    product.name,
    `best ${product.category} shoes Nairobi`,
    `${product.category} shoes Nairobi`,
    `${product.brand} ${product.category} shoes Nairobi`,
    `buy ${product.name} Nairobi`,
    `${product.brand} shoes Nairobi`,
    `trusted ${product.category} shoes Nairobi`,
    `${categoryName.toLowerCase()} Nairobi CBD`,
    "trusted shoe store Nairobi",
    "best athletic shoes Nairobi",
    "Whitelight Store Nairobi",
  ];

  if (product.brand.toLowerCase().includes("nike")) {
    keywords.push("Nike shoes Kenya", "Nike Nairobi", "best Nike seller Kenya");
  }
  if (product.brand.toLowerCase().includes("adidas")) {
    keywords.push("Adidas shoes Kenya", "Adidas Nairobi", "best Adidas seller Kenya");
  }
  if (product.brand.toLowerCase().includes("hoka")) {
    keywords.push("HOKA shoes Kenya", "HOKA Nairobi");
  }
  if (product.brand.toLowerCase().includes("salomon")) {
    keywords.push("Salomon Kenya", "Salomon trail shoes Nairobi");
  }

  return keywords.join(", ");
}

/**
 * Generate canonical URL for a product
 */
export function generateProductCanonical(product: Product): string {
  return `${BASE_URL}/product/${product.slug}`;
}

/**
 * Get category display name
 */
function getCategoryDisplayName(category: string): string {
  const categoryMap: Record<string, string> = {
    running: "Running Shoes",
    trail: "Trail Shoes",
    gym: "Gym Shoes",
    training: "Training Shoes",
    basketball: "Basketball Shoes",
    tennis: "Tennis Shoes",
    accessories: "Accessories",
  };
  return categoryMap[category] || category;
}