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
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: productData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create product');
    }

    return data;
  }

  async updateProduct(id: string, productData: FormData): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: productData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update product');
    }

    return data;
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
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
    }>;
  }): Promise<ApiResponse> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}

export const apiService = new ApiService();