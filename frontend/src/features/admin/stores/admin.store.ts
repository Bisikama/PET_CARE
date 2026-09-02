import { create } from 'zustand';
import { adminService } from '../services/admin.service';

interface AdminState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  pendingKycCount: number;
  setPendingKycCount: (count: number) => void;
  fetchPendingKycCount: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  pendingKycCount: 0,
  setPendingKycCount: (count) => set({ pendingKycCount: count }),
  fetchPendingKycCount: async () => {
    try {
      const result = await adminService.getProviders({ kycStatus: 'PENDING', limit: 1 });
      set({ pendingKycCount: result.meta?.total || 0 });
    } catch (err) {
      console.error('Failed to fetch pending KYC count:', err);
    }
  },
}));
