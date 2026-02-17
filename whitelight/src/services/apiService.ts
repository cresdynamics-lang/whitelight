// API Service - Backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

interface LoginResponse {
  token: string;
  admin: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

class ApiService {
  private token: string | null = null;
  public baseURL = API_BASE_URL;

  constructor() {
    this.token = localStorage.getItem('admin_token');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  // Auth methods
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const data = await this.request<LoginResponse>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (data.success && data.data) {
      this.token = data.data.token;
      localStorage.setItem('admin_token', this.token);
      localStorage.setItem('admin_user', JSON.stringify(data.data.admin));
    }

    return data;
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  async getProfile(): Promise<ApiResponse> {
    return this.request('/admin/profile');
  }

  // Product methods
  async getProducts(params?: Record<string, string>): Promise<ApiResponse> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/products${queryString}`);
  }

  async getProduct(id: string): Promise<ApiResponse> {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: FormData): Promise<ApiResponse> {
    // Create AbortController for timeout (5 minutes for large uploads)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutes
    
    try {
      // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.token}`,
      };
      
      console.log('Uploading to:', `${API_BASE_URL}/products`);
      console.log('FormData entries:', Array.from(productData.entries()).map(([key]) => key));
      
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: headers,
        body: productData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      // Check if response is ok before parsing
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          const text = await response.text();
          if (text) errorMessage = text.substring(0, 200);
        }
        throw new Error(errorMessage);
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server. Please try again.');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout - please try again with fewer images or smaller file sizes');
      }
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        // More detailed network error
        const networkError = error.message || 'Unknown network error';
        const apiUrl = `${API_BASE_URL}/products`;
        console.error('Network error details:', {
          url: apiUrl,
          apiBaseUrl: API_BASE_URL,
          error: networkError,
          message: error.message,
          name: error.name,
          stack: error.stack,
          tokenPresent: !!this.token
        });
        
        // Provide more helpful error message
        let userMessage = 'Network error: Failed to connect to server. ';
        if (apiUrl.includes('localhost')) {
          userMessage += 'Make sure the API server is running. ';
        } else {
          userMessage += 'Please check your internet connection. ';
        }
        userMessage += 'If the problem persists, contact support.';
        
        throw new Error(userMessage);
      }
      // Re-throw with better error message
      const message = error instanceof Error ? error.message : 'Failed to create product. Please try again.';
      console.error('Product creation error:', error);
      throw new Error(message);
    }
  }

  async updateProduct(id: string, productData: FormData): Promise<ApiResponse> {
    // Create AbortController for timeout (5 minutes for large uploads)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutes
    
    try {
      // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.token}`,
      };
      
      console.log('Updating product:', id);
      console.log('FormData entries:', Array.from(productData.entries()).map(([key]) => key));
      
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: headers,
        body: productData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      // Check if response is ok before parsing
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          const text = await response.text();
          if (text) errorMessage = text.substring(0, 200);
        }
        throw new Error(errorMessage);
      }

      // Parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid response from server. Please try again.');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout - please try again with fewer images or smaller file sizes');
      }
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error - please check your connection and try again');
      }
      // Re-throw with better error message
      const message = error instanceof Error ? error.message : 'Failed to update product. Please try again.';
      throw new Error(message);
    }
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Upload images separately and get URLs
  async uploadImages(images: File[]): Promise<ApiResponse> {
    if (!this.token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5 * 60 * 1000); // 5 minutes
    
    try {
      const url = `${API_BASE_URL}/products/images`;
      console.log('Uploading images to:', url);
      console.log('Token present:', !!this.token);
      console.log('Number of images:', images.length);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      console.log('Upload response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('Upload error response:', errorData);
        } catch (e) {
          const text = await response.text();
          if (text) errorMessage = text.substring(0, 200);
          console.error('Upload error text:', text);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Upload success:', data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Upload catch error:', error);
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout - please try again');
      }
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        const networkError = error.message || 'Unknown network error';
        console.error('Network error details:', {
          url: `${API_BASE_URL}/products/images`,
          apiBaseUrl: API_BASE_URL,
          error: networkError,
          message: error.message,
          name: error.name,
          stack: error.stack,
          tokenPresent: !!this.token
        });
        throw new Error('Network error: Failed to upload images. Please check your connection and try again.');
      }
      const message = error instanceof Error ? error.message : 'Failed to upload images';
      throw new Error(message);
    }
  }

  // Order methods
  async getOrders(params?: Record<string, string>): Promise<ApiResponse> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request(`/orders${queryString}`);
  }

  async getOrder(id: string): Promise<ApiResponse> {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse> {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async createOrder(orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress?: string;
    orderNotes?: string;
    items: Array<{
      productId: string;
      productName: string;
      productPrice: number;
      size: number;
      quantity: number;
      productImage?: string;
      selectedSizes?: number[];
      referenceLink?: string;
    }>;
  }): Promise<ApiResponse> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}

export const apiService = new ApiService();