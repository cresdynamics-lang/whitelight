// Product data service - Backend API integration
import type { Product, ProductFilters, ProductsResponse, ProductCategory } from "@/types/product";
import { apiService } from "@/services/apiService";

// Transform backend response to frontend format
const transformBackendResponse = (backendData: any): ProductsResponse => {
  return {
    products: backendData.products || [],
    total: backendData.pagination?.total || backendData.products?.length || 0,
    page: backendData.pagination?.page || 1,
    limit: backendData.pagination?.limit || backendData.products?.length || 0,
  };
};

// Get all products with optional filters
export async function getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
  try {
    const params: Record<string, string> = {};
    
    if (filters) {
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.isNew !== undefined) params.isNew = filters.isNew.toString();
      if (filters.isBestSeller !== undefined) params.isBestSeller = filters.isBestSeller.toString();
      if (filters.minPrice !== undefined) params.minPrice = filters.minPrice.toString();
      if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice.toString();
      if (filters.search) params.search = filters.search;
    }
    
    const response = await apiService.getProducts(params);
    
    if (response.success) {
      return transformBackendResponse(response.data);
    }
    
    throw new Error(response.message || 'Failed to fetch products');
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty response on error
    return {
      products: [],
      total: 0,
      page: 1,
      limit: 0,
    };
  }
}

// Get single product by slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await apiService.getProduct(slug);
    
    if (response.success) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Get best sellers
export async function getBestSellers(limit?: number): Promise<Product[]> {
  const params: Record<string, string> = { isBestSeller: 'true' };
  if (limit) params.limit = limit.toString();
  
  const { products } = await getProducts({ isBestSeller: true });
  return limit ? products.slice(0, limit) : products;
}

// Get new arrivals
export async function getNewArrivals(limit?: number): Promise<Product[]> {
  const { products } = await getProducts({ isNew: true });
  return limit ? products.slice(0, limit) : products;
}

// Get products by category
export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  const { products } = await getProducts({ category });
  return products;
}

// Format price with currency
export function formatPrice(price: number, currency: string = "KSh"): string {
  return `${currency} ${price.toLocaleString()}`;
}
