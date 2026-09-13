import { create } from 'zustand';
import { subscriptionService } from '../services/subscription.service';
import { SubscriptionCheckoutDto, UserSubscription } from '../types/subscription.types';

interface SubscriptionState {
  mySubscription: UserSubscription | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isOpen: boolean;
  error: string | null;

  openModal: () => void;
  closeModal: () => void;
  fetchMySubscription: (force?: boolean) => Promise<void>;
  checkoutVnPay: (dto: SubscriptionCheckoutDto) => Promise<string | null>;
  checkoutWallet: (dto: SubscriptionCheckoutDto) => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  mySubscription: null,
  isLoading: false,
  isSubmitting: false,
  isOpen: false,
  error: null,

  openModal: () => set({ isOpen: true, error: null }),
  closeModal: () => set({ isOpen: false, error: null }),

  fetchMySubscription: async (force = false) => {
    if (!force && get().mySubscription) return;
    set({ isLoading: true, error: null });
    try {
      const sub = await subscriptionService.getMySubscription();
      set({ mySubscription: sub, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tải gói dịch vụ hiện tại', isLoading: false });
    }
  },

  checkoutVnPay: async (dto: SubscriptionCheckoutDto) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await subscriptionService.checkoutVnPay(dto);
      set({ isSubmitting: false });
      return res.paymentUrl;
    } catch (err: any) {
      set({ error: err?.message || 'Không thể tạo liên kết VNPay', isSubmitting: false });
      return null;
    }
  },

  checkoutWallet: async (dto: SubscriptionCheckoutDto) => {
    set({ isSubmitting: true, error: null });
    try {
      const newSub = await subscriptionService.checkoutWallet(dto);
      set({ mySubscription: newSub, isSubmitting: false, isOpen: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Thanh toán bằng ví thất bại', isSubmitting: false });
      return false;
    }
  },
}));
