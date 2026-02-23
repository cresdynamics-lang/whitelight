import { Product } from "@/types/product";

const BASE_URL = "https://whitelightstore.co.ke";

/**
 * Generate SEO-optimized title for a product
 * Format: "Product Name - Brand Category Shoes | Best Trusted Seller in Nairobi Kenya"
 */
export function generateProductTitle(product: Product): string {
  const categoryName = getCategoryDisplayName(product.category);
  return `${product.name} - ${product.brand} ${categoryName} | Best Trusted Seller in Nairobi Kenya`;
}

/**
 * Generate SEO-optimized description for a product
 */
export function generateProductDescription(product: Product): string {
  const availableSizes = product.variants
    .filter((v) => v.inStock)
    .map((v) => v.size)
    .join(", ");
  
  const priceText = product.originalPrice && product.originalPrice > product.price
    ? `Now KES ${product.price.toLocaleString()} (was KES ${product.originalPrice.toLocaleString()})`
    : `KES ${product.price.toLocaleString()}`;

  const categoryName = getCategoryDisplayName(product.category);
  
  return `Buy ${product.name} by ${product.brand} - Kenya's best trusted specialized seller for premium ${categoryName.toLowerCase()} in Nairobi. ${product.description.substring(0, 100)}... Available sizes: ${availableSizes || "Check availability"}. ${priceText}. Same day delivery in Nairobi CBD. Visit Whitelight Store - Kenya's trusted specialized footwear retailer at Rware Building, Luthuli Avenue, Shop 410.`;
}

/**
 * Generate SEO keywords for a product
 */
export function generateProductKeywords(product: Product): string {
  const categoryName = getCategoryDisplayName(product.category);
  const keywords = [
    product.name,
    `${product.brand} ${product.category} shoes`,
    `${product.category} shoes Kenya`,
    `${product.category} shoes Nairobi`,
    `buy ${product.name} Kenya`,
    `${product.brand} shoes Nairobi`,
    `best ${product.category} shoes Nairobi`,
    `best trusted ${product.category} shoes seller Kenya`,
    `specialized ${product.category} shoes Nairobi`,
    `trusted ${product.category} shoes seller Nairobi`,
    `cheap ${product.category} shoes Kenya`,
    `affordable ${product.category} shoes Nairobi`,
    "trusted shoe seller Nairobi",
    "best shoe store Kenya",
    "specialized footwear seller Nairobi",
    "premium shoes Nairobi CBD",
  ];

  // Add brand-specific keywords
  if (product.brand.toLowerCase().includes("nike")) {
    keywords.push("Nike shoes Kenya", "Nike Nairobi", "best Nike seller Kenya");
  }
  if (product.brand.toLowerCase().includes("adidas")) {
    keywords.push("Adidas shoes Kenya", "Adidas Nairobi", "best Adidas seller Kenya");
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
    accessories: "Accessories",
  };
  return categoryMap[category] || category;
}
