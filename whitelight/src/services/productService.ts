// Product Service - Backend API integration
import { Product } from "@/types/product";
import { apiService } from "@/services/apiService";

// Transform backend product data to frontend format
const transformProduct = (backendProduct: any): Product => {
  return {
    id: backendProduct.id,
    slug: backendProduct.slug,
    name: backendProduct.name,
    brand: backendProduct.brand,
    category: backendProduct.category,
    price: backendProduct.price,
    originalPrice: backendProduct.originalPrice,
    images: backendProduct.images || [],
    variants: backendProduct.variants || [],
    description: backendProduct.description,
    tags: backendProduct.tags || [],
    isNew: backendProduct.isNew || false,
    isBestSeller: backendProduct.isBestSeller || false,
    isOnOffer: backendProduct.isOnOffer || false,
    createdAt: backendProduct.createdAt
  };
};

// Transform frontend product data to backend format
const transformProductForBackend = (product: Omit<Product, "id" | "createdAt">) => {
  const formData = new FormData();
  
  formData.append('name', product.name);
  formData.append('brand', product.brand);
  formData.append('category', product.category);
  formData.append('price', product.price.toString());
  if (product.originalPrice) {
    formData.append('originalPrice', product.originalPrice.toString());
  }
  formData.append('description', product.description);
  formData.append('tags', JSON.stringify(product.tags));
  formData.append('isNew', product.isNew?.toString() || 'false');
  formData.append('isBestSeller', product.isBestSeller?.toString() || 'false');
  formData.append('isOnOffer', product.isOnOffer?.toString() || 'false');
  formData.append('variants', JSON.stringify(product.variants));
  
  return formData;
};

export const productService = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await apiService.getProducts();
      if (response.success) {
        return response.data.products.map(transformProduct);
      }
      throw new Error(response.message || 'Failed to fetch products');
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  getById: async (id: string): Promise<Product | null> => {
    try {
      const response = await apiService.getProduct(id);
      if (response.success) {
        return transformProduct(response.data);
      }
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Create new product
  create: async (product: Omit<Product, "id" | "createdAt">, images?: File[]): Promise<Product> => {
    try {
      const formData = transformProductForBackend(product);
      
      // Add image files
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append('images', image);
        });
      }
      
      const response = await apiService.createProduct(formData);
      if (response.success) {
        // Fetch the created product to get complete data
        const createdProduct = await productService.getById(response.data.id);
        if (createdProduct) {
          return createdProduct;
        }
      }
      throw new Error(response.message || 'Failed to create product');
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  update: async (id: string, updates: Partial<Product>, images?: File[], imagesToDelete?: string[]): Promise<Product | null> => {
    try {
      const formData = new FormData();
      
      // Add updated fields
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'createdAt') {
          if (key === 'tags' || key === 'variants') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Add images to delete
      if (imagesToDelete && imagesToDelete.length > 0) {
        formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }
      
      // Add new image files
      if (images && images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      const response = await apiService.updateProduct(id, formData);
      if (response.success) {
        // Fetch the updated product to get complete data
        return await productService.getById(id);
      }
      throw new Error(response.message || 'Failed to update product');
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  delete: async (id: string): Promise<boolean> => {
    try {
      const response = await apiService.deleteProduct(id);
      return response.success;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },

  // Reset to original data (not applicable for backend)
  resetToDefault: async (): Promise<void> => {
    // This method is not applicable when using backend API
    console.warn('resetToDefault is not applicable when using backend API');
  },
};
