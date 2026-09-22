import { create } from 'zustand';
import { meService } from '../services/me.service';
import { User } from '../types';

interface MeState {
  isOpen: boolean;
  isAddressModalOpen: boolean;
  user: User | null;
  notificationSettings: any | null;
  isLoading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  openAddressModal: () => void;
  closeAddressModal: () => void;
  fetchMe: () => Promise<void>;
  fetchUserMe: (force?: boolean) => Promise<void>;
  updateNotificationSettings: (settings: any) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  deactivateAccount: () => Promise<boolean>;
}

export const useMeStore = create<MeState>((set, get) => ({
  isOpen: false,
  isAddressModalOpen: false,
  user: null,
  notificationSettings: null,
  isLoading: false,
  error: null,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false, error: null }),
  openAddressModal: () => set({ isAddressModalOpen: true }),
  closeAddressModal: () => set({ isAddressModalOpen: false }),

  fetchMe: async () => {
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

  fetchUserMe: async (force = false) => {
    if (!force && get().user) return;
    set({ isLoading: true, error: null });
    try {
      const user = await meService.getUserMe();
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể lấy thông tin người dùng', isLoading: false });
    }
  },

  updateNotificationSettings: async (settings: any) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await meService.updateNotificationSettings(settings);
      set({ notificationSettings: updated, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể cập nhật cài đặt thông báo', isLoading: false });
      return false;
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await meService.deleteAccount();
      set({ user: null, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể xóa tài khoản', isLoading: false });
      return false;
    }
  },

  deactivateAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await meService.deactivateAccount();
      set({ user: null, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể vô hiệu hóa tài khoản', isLoading: false });
      return false;
    }
  },
}));

