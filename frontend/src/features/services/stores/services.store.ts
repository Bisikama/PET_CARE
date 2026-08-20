import { create } from 'zustand';
import { servicesService } from '../services/services.service';
import { Service } from '../types';

interface ServicesState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  clearError: () => void;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,

  fetchServices: async () => {
    // Tránh gọi API trùng lặp nếu đang tải
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const services = await servicesService.getServices();
      set({ services, isLoading: false, error: null });
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể tải danh sách dịch vụ thú cưng.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
