import { apiService } from "@/services/apiService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface BannerImage {
  url: string;
  alt_text: string;
}

export interface CategoryImage extends BannerImage {
  category: string;
}

export const bannerService = {
  // Get hero carousel images
  getHeroImages: async (): Promise<BannerImage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/hero`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching hero images:', error);
      return [];
    }
  },

  // Get category images
  getCategoryImages: async (): Promise<CategoryImage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching category images:', error);
      return [];
    }
  },

  // Get CTA banner images
  getCtaImages: async (): Promise<BannerImage[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/cta`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching CTA images:', error);
      return [];
    }
  },
};