import { create } from 'zustand';
import { adminService } from '../services/admin.service';

interface AdminState {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  pendingKycCount: number;
  adminUsers: any[];
  deactivationRequests: any[];
  systemConfigs: any | null;
  error: string | null;

  setPendingKycCount: (count: number) => void;
  fetchPendingKycCount: () => Promise<void>;
  fetchAdminUsers: (force?: boolean) => Promise<void>;
  fetchDeactivationRequests: (force?: boolean) => Promise<void>;
  fetchSystemConfigs: (force?: boolean) => Promise<void>;
  approveDeactivation: (id: string) => Promise<boolean>;
  rejectDeactivation: (id: string, reason?: string) => Promise<boolean>;
  updateConfigs: (configs: any) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  pendingKycCount: 0,
  adminUsers: [],
  deactivationRequests: [],
  systemConfigs: null,
  error: null,

  setPendingKycCount: (count) => set({ pendingKycCount: count }),

  fetchPendingKycCount: async () => {
    try {
      const result = await adminService.getProviders({ kycStatus: 'PENDING', limit: 1 });
      set({ pendingKycCount: result.meta?.total || 0 });
    } catch (err) {
      console.error('Failed to fetch pending KYC count:', err);
    }
  },

  fetchAdminUsers: async (force = false) => {
    if (!force && get().adminUsers.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.getUsers();
      set({ adminUsers: res.data || res, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải danh sách người dùng', isLoading: false });
    }
  },

  fetchDeactivationRequests: async (force = false) => {
    if (!force && get().deactivationRequests.length > 0) return;
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.getDeactivationRequests();
      set({ deactivationRequests: res, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải yêu cầu hủy tài khoản', isLoading: false });
    }
  },

  fetchSystemConfigs: async (force = false) => {
    if (!force && get().systemConfigs) return;
    set({ isLoading: true, error: null });
    try {
      const res = await adminService.getConfigs();
      set({ systemConfigs: res, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải cấu hình hệ thống', isLoading: false });
    }
  },

  approveDeactivation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.approveDeactivation(id);
      await get().fetchDeactivationRequests(true);
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể phê duyệt hủy tài khoản', isLoading: false });
      return false;
    }
  },

  rejectDeactivation: async (id: string, reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.rejectDeactivation(id, reason);
      await get().fetchDeactivationRequests(true);
      set({ isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể từ chối yêu cầu', isLoading: false });
      return false;
    }
  },

  updateConfigs: async (configs: any) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await adminService.updateConfigs(configs);
      set({ systemConfigs: updated, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể cập nhật cấu hình', isLoading: false });
      return false;
    }
  },
}));

