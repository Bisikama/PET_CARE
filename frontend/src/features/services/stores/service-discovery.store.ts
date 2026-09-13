import { create } from 'zustand';
import { serviceDiscoveryService } from '../services/service-discovery.service';
import { ServicePackage, ServiceRecommendation, ServiceSuggestionDto } from '../types/discovery.types';

interface ServiceDiscoveryState {
  packages: ServicePackage[];
  recommendations: ServiceRecommendation[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchPackages: (force?: boolean) => Promise<void>;
  fetchRecommendations: (petId?: string, force?: boolean) => Promise<void>;
  createSuggestion: (dto: ServiceSuggestionDto) => Promise<boolean>;
}

export const useServiceDiscoveryStore = create<ServiceDiscoveryState>((set, get) => ({
  packages: [],
  recommendations: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchPackages: async (force = false) => {
    if (!force && get().packages.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await serviceDiscoveryService.getPackages();
      set({ packages: data, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải gói dịch vụ', isLoading: false });
    }
  },

  fetchRecommendations: async (petId?: string, force = false) => {
    if (!force && get().recommendations.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await serviceDiscoveryService.getRecommendations(petId);
      set({ recommendations: data, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải gợi ý dịch vụ', isLoading: false });
    }
  },

  createSuggestion: async (dto: ServiceSuggestionDto) => {
    set({ isSubmitting: true, error: null });
    try {
      await serviceDiscoveryService.createSuggestion(dto);
      set({ isSubmitting: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể gửi đề xuất dịch vụ', isSubmitting: false });
      return false;
    }
  },
}));
