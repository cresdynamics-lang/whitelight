// Product types - Ready for API integration
// These types define the shape of all product data

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface ProductVariant {
  id: string;
  size: number | string; // Support both shoe sizes (number) and clothing sizes (string)
  inStock: boolean;
  stockQuantity?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: "running" | "trail" | "gym" | "basketball" | "accessories" | "training"; // Primary category (backward compatibility)
  categories?: ("running" | "trail" | "gym" | "basketball" | "accessories" | "training")[]; // Multiple categories
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  description: string;
  tags: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isOnOffer?: boolean;
  createdAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

// Category type for filtering
export type ProductCategory = Product["category"];

// Filter options
export interface ProductFilters {
  category?: ProductCategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  search?: string;
}

// Cart types
export interface CartItem {
  product: Product;
  size: number | string; // Support both shoe and clothing sizes
  selectedSizes?: (number | string)[];
  referenceLink?: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
