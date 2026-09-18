import { apiClient } from './client';

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
  durationMinutes: number;
  isActive?: boolean;
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
  // Get all active services/categories
  getAllServices: async (): Promise<ServiceCategory[]> => {
    const response = await apiClient.get('/services');
    return response.data.data;
  },

  // Get service details by ID
  getServiceDetails: async (id: string): Promise<ServiceCategory> => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data.data;
  },

  // Get pricing rules (pet size, addons)
  getPricingRules: async (serviceId: string): Promise<PricingRule[]> => {
    const response = await apiClient.get(`/services/${serviceId}/pricing-rules`);
    return response.data.data;
  },

  // Get checklist templates (What's included)
  getChecklistTemplates: async (serviceId: string): Promise<ChecklistTemplate[]> => {
    const response = await apiClient.get(`/services/${serviceId}/checklist-templates`);
    return response.data.data;
  },
};

export const serviceDiscoveryApi = {
  // Get top rated providers
  getRecommendations: async (): Promise<RecommendedProvider[]> => {
    const response = await apiClient.get('/service-discovery/recommendations');
    return response.data.data;
  },

  // Search/Discover providers for a specific service
  discoverProviders: async (params: {
    serviceId: string;
    city?: string;
    district?: string;
    ward?: string;
    priceMin?: number;
    priceMax?: number;
    ratingMin?: number;
    hasTrustBadge?: boolean;
  }) => {
    const response = await apiClient.get('/service-discovery/providers', { params });
    return response.data.data;
  },

  // Get single provider details
  getProviderDetails: async (providerId: string): Promise<RecommendedProvider> => {
    const response = await apiClient.get(`/service-discovery/providers/${providerId}`);
    return response.data.data || response.data;
  },
};
