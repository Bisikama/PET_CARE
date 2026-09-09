import axiosInstance from '@/lib/axios';
import { ServicePackage, ServiceRecommendation, ServiceSuggestionDto } from '../types/discovery.types';

export const serviceDiscoveryService = {
  getPackages: async (): Promise<ServicePackage[]> => {
    const response = await axiosInstance.get<ServicePackage[]>('/service-discovery/packages');
    return response.data;
  },

  getRecommendations: async (petId?: string): Promise<ServiceRecommendation[]> => {
    const response = await axiosInstance.get<ServiceRecommendation[]>('/service-discovery/recommendations', {
      params: { petId },
    });
    return response.data;
  },

  createSuggestion: async (dto: ServiceSuggestionDto): Promise<any> => {
    const response = await axiosInstance.post('/services/suggestions', dto);
    return response.data;
  },
};
