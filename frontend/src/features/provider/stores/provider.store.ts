import { create } from 'zustand';
import { providerService } from '../services/provider.service';
import { ProviderUser } from '../types';

interface ProviderState {
  providerData: ProviderUser | null;
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  step: number;
  fetchProviderMe: () => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
  setStep: (step: number) => void;
}

export const useProviderStore = create<ProviderState>((set) => ({
  providerData: null,
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

  openModal: () => set({ isOpen: true, step: 1, error: null }),
  closeModal: () => set({ isOpen: false, step: 1, error: null }),
  setStep: (step: number) => set({ step }),
}));
