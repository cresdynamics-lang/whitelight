// Product types - Ready for API integration
// These types define the shape of all product data

export type ProductPurpose =
  | "race_day"
  | "daily"
  | "long_run"
  | "trail"
  | "gym"
  | "court";

export type FitNote = "true_to_size" | "half_up" | "runs_small" | "runs_large";

export type ImageAngleRole = "side" | "front" | "heel" | "sole" | "detail" | "spin";

export interface ProductFeel {
  cushion?: number;
  response?: number;
  grip?: number;
  stability?: number;
  weight?: number;
  durability?: number;
}

export interface ProductHotspot {
  id: string;
  label: string;
  body: string;
  x: number;
  y: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  angleRole?: ImageAngleRole;
}

export interface ProductVariant {
  id: string;
  size: number | string;
  inStock: boolean;
  stockQuantity?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: "running" | "trail" | "gym" | "basketball" | "accessories" | "training" | "tennis";
  categories?: ("running" | "trail" | "gym" | "basketball" | "accessories" | "training" | "tennis")[];
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
  updatedAt?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  product_h1?: string | null;
  product_description?: string | null;
  url_slug?: string | null;
  alt_text_main?: string | null;
  seo_keywords?: string[] | null;
  gender?: string | null;
  structured_data?: unknown;
  /** Blueprint fields */
  purpose?: ProductPurpose;
  feel?: ProductFeel;
  fitNote?: FitNote;
  forWhom?: string;
  skipIf?: string;
  hotspots?: ProductHotspot[];
  saleEndsAt?: string | null;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export type ProductCategory = Product["category"];

export interface ProductFilters {
  category?: ProductCategory;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  search?: string;
}

export interface CartItem {
  product: Product;
  size: number | string;
  selectedSizes?: (number | string)[];
  referenceLink?: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
