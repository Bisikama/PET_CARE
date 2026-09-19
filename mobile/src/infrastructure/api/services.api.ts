import { apiClient } from './client';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
  durationMinutes: number;
  isActive?: boolean;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
}

export interface RecommendedProvider {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  rating: number;
  totalReviews: number;
  baseAddress: string | null;
}

export interface PricingRule {
  id: string;
  serviceId: string;
  petSpecies: string;
  minWeight: number | null;
  maxWeight: number | null;
  price: number;
  durationMinutes: number;
  isActive?: boolean;
}

export interface ChecklistTemplate {
  id: string;
  serviceId: string;
  title: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
}

export const servicesApi = {
  // Get all active services from database
  getAllServices: async (): Promise<ServiceCategory[]> => {
    try {
      const response = await apiClient.get('/services');
      const raw = response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    } catch (error) {
      return [];
    }
  },

  // Get service details by ID
  getServiceDetails: async (id: string): Promise<ServiceCategory | null> => {
    try {
      const response = await apiClient.get(`/services/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      return null;
    }
  },

  // Get pricing rules (pet size, addons)
  getPricingRules: async (serviceId: string): Promise<PricingRule[]> => {
    try {
      const response = await apiClient.get(`/services/${serviceId}/pricing-rules`);
      const raw = response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    } catch (error) {
      return [];
    }
  },

  // Get checklist templates (What's included)
  getChecklistTemplates: async (serviceId: string): Promise<ChecklistTemplate[]> => {
    try {
      const response = await apiClient.get(`/services/${serviceId}/checklist-templates`);
      const raw = response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    } catch (error) {
      return [];
    }
  },
};

export const serviceDiscoveryApi = {
  // Get top rated providers
  getRecommendations: async (): Promise<RecommendedProvider[]> => {
    try {
      const response = await apiClient.get('/service-discovery/recommendations');
      const raw = response.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    } catch (error) {
      return [];
    }
  },

  // Search/Discover providers for a specific service
  discoverProviders: async (params: {
    serviceId?: string;
    city?: string;
    district?: string;
    ward?: string;
    priceMin?: number;
    priceMax?: number;
    ratingMin?: number;
    hasTrustBadge?: boolean;
  }) => {
    try {
      const response = await apiClient.get('/service-discovery/providers', { params });
      return response.data?.data || response.data;
    } catch (error) {
      return [];
    }
  },

  // Get single provider details
  getProviderDetails: async (providerId: string): Promise<RecommendedProvider | null> => {
    try {
      const response = await apiClient.get(`/service-discovery/providers/${providerId}`);
      return response.data?.data || response.data;
    } catch (error) {
      return null;
    }
  },
};
