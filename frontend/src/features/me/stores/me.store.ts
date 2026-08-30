import { create } from 'zustand';
import { meService } from '../services/me.service';
import { User } from '../types';

interface MeState {
  isOpen: boolean;
  isAddressModalOpen: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  openAddressModal: () => void;
  closeAddressModal: () => void;
  fetchMe: () => Promise<void>;
}

export const useMeStore = create<MeState>((set, get) => ({
  isOpen: false,
  isAddressModalOpen: false,
  user: null,
  isLoading: false,
  error: null,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false, error: null }),
  openAddressModal: () => set({ isAddressModalOpen: true }),
  closeAddressModal: () => set({ isAddressModalOpen: false }),
  fetchMe: async () => {
    // Nếu đã có thông tin user rồi thì không cần gọi API nữa
    if (get().user) return;

    set({ isLoading: true, error: null });
    try {
      const user = await meService.getMe();
      set({ user, isLoading: false });
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Không thể tải thông tin cá nhân.';
      set({ error: errorMessage, isLoading: false });
    }
  },
}));
