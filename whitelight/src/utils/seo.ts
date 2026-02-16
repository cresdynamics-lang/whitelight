import { Product } from "@/types/product";

const BASE_URL = "https://whitelightstore.co.ke";

/**
 * Generate SEO-optimized title for a product
 * Format: "Product Name - Brand Category Shoes | Buy in Nairobi Kenya"
 */
export function generateProductTitle(product: Product): string {
  const categoryName = getCategoryDisplayName(product.category);
  return `${product.name} - ${product.brand} ${categoryName} | Buy in Nairobi Kenya`;
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

  return `Buy ${product.name} by ${product.brand} in Nairobi, Kenya. ${product.description.substring(0, 100)}... Available sizes: ${availableSizes || "Check availability"}. ${priceText}. Same day delivery in Nairobi CBD. Visit Whitelight Store at Rware Building, Luthuli Avenue.`;
}

/**
 * Generate SEO keywords for a product
 */
export function generateProductKeywords(product: Product): string {
  const keywords = [
    product.name,
    `${product.brand} ${product.category} shoes`,
    `${product.category} shoes Kenya`,
    `${product.category} shoes Nairobi`,
    `buy ${product.name} Kenya`,
    `${product.brand} shoes Nairobi`,
    `best ${product.category} shoes Nairobi`,
    `cheap ${product.category} shoes Kenya`,
    `affordable ${product.category} shoes Nairobi`,
  ];

  // Add brand-specific keywords
  if (product.brand.toLowerCase().includes("nike")) {
    keywords.push("Nike shoes Kenya", "Nike Nairobi");
  }
  if (product.brand.toLowerCase().includes("adidas")) {
    keywords.push("Adidas shoes Kenya", "Adidas Nairobi");
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
    basketball: "Basketball Shoes",
    accessories: "Accessories",
  };
  return categoryMap[category] || category;
}

/**
 * Generate structured data for product schema
 */
export function generateProductStructuredData(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    category: getCategoryDisplayName(product.category),
    sku: product.id,
    image: product.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/product/${product.slug}`,
      priceCurrency: "KES",
      price: product.price.toString(),
      availability: product.variants.some((v) => v.inStock)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "LocalBusiness",
        name: "Whitelight Store Kenya",
      },
    },
  };
}
