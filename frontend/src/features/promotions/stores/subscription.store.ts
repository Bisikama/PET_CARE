import { create } from 'zustand';
import { getApiErrorMessage, subscriptionService } from '../services/subscription.service';
import type {
  SubscriptionBankTransferCheckout,
  SubscriptionOrder,
  SubscriptionPlan,
  UserSubscription,
} from '../types/subscription.types';

interface SubscriptionState {
  plans: SubscriptionPlan[];
  mySubscription: UserSubscription | null;
  myOrders: SubscriptionOrder[];
  isLoading: boolean;
  isSubmitting: boolean;
  isOpen: boolean;
  /** Gói được chọn sẵn khi mở modal */
  selectedPlanCode: string | null;
  error: string | null;

  openModal: (planCode?: string) => void;
  closeModal: () => void;
  clearError: () => void;
  fetchAll: () => Promise<void>;
  fetchMySubscription: () => Promise<void>;
  checkoutBankTransfer: (planCode: string) => Promise<SubscriptionBankTransferCheckout | null>;
  checkoutVnPay: (planCode: string) => Promise<string | null>;
  checkoutWallet: (planCode: string) => Promise<boolean>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: [],
  mySubscription: null,
  myOrders: [],
  isLoading: false,
  isSubmitting: false,
  isOpen: false,
  selectedPlanCode: null,
  error: null,

  openModal: (planCode) => set({ isOpen: true, error: null, selectedPlanCode: planCode ?? null }),
  closeModal: () => set({ isOpen: false, error: null }),
  clearError: () => set({ error: null }),

  fetchAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [plans, mySubscription, myOrders] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getMySubscription().catch(() => null),
        subscriptionService.getMyOrders().catch(() => []),
      ]);
      set({ plans, mySubscription, myOrders, isLoading: false });
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Không thể tải danh sách gói'), isLoading: false });
    }
  },

  fetchMySubscription: async () => {
    try {
      const [mySubscription, myOrders] = await Promise.all([
        subscriptionService.getMySubscription(),
        subscriptionService.getMyOrders(),
      ]);
      set({ mySubscription, myOrders });
    } catch {
      // giữ dữ liệu cũ
    }
  },

  checkoutBankTransfer: async (planCode) => {
    set({ isSubmitting: true, error: null });
    try {
      const checkout = await subscriptionService.checkoutBankTransfer({ planCode });
      set({ isSubmitting: false });
      return checkout;
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Không tạo được thông tin chuyển khoản'), isSubmitting: false });
      return null;
    }
  },

  checkoutVnPay: async (planCode) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await subscriptionService.checkoutVnPay({ planCode });
      set({ isSubmitting: false });
      return res.paymentUrl;
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Không thể tạo liên kết VNPay'), isSubmitting: false });
      return null;
    }
  },

  checkoutWallet: async (planCode) => {
    set({ isSubmitting: true, error: null });
    try {
      await subscriptionService.checkoutWallet({ planCode });
      set({ isSubmitting: false });
      await get().fetchMySubscription();
      return true;
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Thanh toán bằng ví thất bại'), isSubmitting: false });
      return false;
    }
  },
}));
