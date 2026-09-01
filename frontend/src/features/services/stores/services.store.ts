import { create } from 'zustand';
import { servicesService } from '../services/services.service';
import { Service, CreateServiceData, UpdateServiceData } from '../types';

interface ServicesState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  createService: (data: CreateServiceData) => Promise<Service>;
  updateService: (id: string, data: UpdateServiceData) => Promise<Service>;
  deleteService: (id: string) => Promise<void>;
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

  createService: async (data: CreateServiceData) => {
    set({ isLoading: true, error: null });
    try {
      const newService = await servicesService.createService(data);
      set((state) => ({
        services: [newService, ...state.services],
        isLoading: false,
        error: null,
      }));
      return newService;
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể tạo gói dịch vụ mới.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateService: async (id: string, data: UpdateServiceData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await servicesService.updateService(id, data);
      set((state) => ({
        services: state.services.map((s) => (s.id === id ? updated : s)),
        isLoading: false,
        error: null,
      }));
      return updated;
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể cập nhật gói dịch vụ.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  deleteService: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await servicesService.deleteService(id);
      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
        isLoading: false,
        error: null,
      }));
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể xóa gói dịch vụ này.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));


