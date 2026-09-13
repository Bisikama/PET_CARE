import { create } from 'zustand';
import { providerService } from '../services/provider.service';
import { ProviderUser } from '../types';

interface ProviderState {
  providerData: ProviderUser | null;
  dashboardData: any | null;
  reviews: any[];
  trustScoreLogs: any[];
  capabilities: any[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  step: number;
  fetchProviderMe: () => Promise<void>;
  fetchDashboard: (force?: boolean) => Promise<void>;
  fetchReviews: (force?: boolean) => Promise<void>;
  fetchTrustScoreLogs: (force?: boolean) => Promise<void>;
  fetchCapabilities: (force?: boolean) => Promise<void>;
  updateProviderStatus: (status: string) => Promise<boolean>;
  openModal: () => void;
  closeModal: () => void;
  setStep: (step: number) => void;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  providerData: null,
  dashboardData: null,
  reviews: [],
  trustScoreLogs: [],
  capabilities: [],
  isLoading: false,
  error: null,
  isOpen: false,
  step: 1,

  fetchProviderMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await providerService.getProviderMe();
      set({ providerData: data, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching provider info:', err);
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể tải thông tin đối tác.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchDashboard: async (force = false) => {
    if (!force && get().dashboardData) return;
    set({ isLoading: true, error: null });
    try {
      const data = await providerService.getDashboard();
      set({ dashboardData: data, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải dashboard', isLoading: false });
    }
  },

  fetchReviews: async (force = false) => {
    if (!force && get().reviews.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await providerService.getReviews();
      set({ reviews: data, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải danh sách nhận xét', isLoading: false });
    }
  },

  fetchTrustScoreLogs: async (force = false) => {
    if (!force && get().trustScoreLogs.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await providerService.getTrustScoreLogs();
      set({ trustScoreLogs: data, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải lịch sử điểm uy tín', isLoading: false });
    }
  },

  fetchCapabilities: async (force = false) => {
    if (!force && get().capabilities.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const data = await providerService.getCapabilities();
      set({ capabilities: data, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải capabilities', isLoading: false });
    }
  },

  updateProviderStatus: async (status: string) => {
    set({ isLoading: true, error: null });
    try {
      await providerService.updateStatus(status);
      await get().fetchProviderMe();
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể cập nhật trạng thái', isLoading: false });
      return false;
    }
  },

  openModal: () => set({ isOpen: true, step: 1, error: null }),
  closeModal: () => set({ isOpen: false, step: 1, error: null }),
  setStep: (step: number) => set({ step }),
}));

