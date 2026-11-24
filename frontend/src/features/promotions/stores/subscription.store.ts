import { create } from 'zustand';
import { getApiErrorMessage, subscriptionService } from '../services/subscription.service';
import type {
  SubscriptionBankTransferCheckout,
  SubscriptionOrder,
  SubscriptionPaymentMethod,
  SubscriptionPlan,
  UserSubscription,
} from '../types/subscription.types';

export interface OpenSubscriptionModalOptions {
  method?: SubscriptionPaymentMethod;
  autoStartTransfer?: boolean;
}

interface SubscriptionState {
  plans: SubscriptionPlan[];
  mySubscription: UserSubscription | null;
  myOrders: SubscriptionOrder[];
  isLoading: boolean;
  isSubmitting: boolean;
  isOpen: boolean;
  /** Gói được chọn sẵn khi mở modal */
  selectedPlanCode: string | null;
  /** Phương thức thanh toán được chọn sẵn khi mở modal (dùng cho Thanh toán lại) */
  initialMethod: SubscriptionPaymentMethod | null;
  /** Tự động mở thẳng màn hình mã QR chuyển khoản khi khách bấm "Xem mã QR / Tiếp tục TT" */
  autoStartTransfer: boolean;
  error: string | null;

  openModal: (planCode?: string, options?: OpenSubscriptionModalOptions) => void;
  closeModal: () => void;
  clearError: () => void;
  fetchAll: () => Promise<void>;
  fetchMySubscription: () => Promise<void>;
  checkOrderStatus: (orderId: string) => Promise<SubscriptionOrder | null>;
  cancelOrder: (orderId: string) => Promise<boolean>;
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
  initialMethod: null,
  autoStartTransfer: false,
  error: null,

  openModal: (planCode, options) =>
    set({
      isOpen: true,
      error: null,
      selectedPlanCode: planCode ?? null,
      initialMethod: options?.method ?? null,
      autoStartTransfer: options?.autoStartTransfer ?? false,
    }),

  closeModal: () => {
    set({ isOpen: false, error: null, initialMethod: null, autoStartTransfer: false });
    void get().fetchMySubscription();
  },

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
        subscriptionService.getMySubscription().catch(() => null),
        subscriptionService.getMyOrders().catch(() => []),
      ]);
      set({ mySubscription, myOrders });
    } catch {
      // giữ dữ liệu cũ
    }
  },

  checkOrderStatus: async (orderId) => {
    try {
      const order = await subscriptionService.getMyOrder(orderId);
      await get().fetchMySubscription();
      return order;
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Không thể kiểm tra trạng thái đơn') });
      return null;
    }
  },

  cancelOrder: async (orderId) => {
    set({ error: null });
    try {
      await subscriptionService.cancelMyOrder(orderId);
      await get().fetchMySubscription();
      return true;
    } catch (err) {
      set({ error: getApiErrorMessage(err, 'Không thể huỷ đơn thanh toán') });
      return false;
    }
  },

  checkoutBankTransfer: async (planCode) => {
    set({ isSubmitting: true, error: null });
    try {
      const checkout = await subscriptionService.checkoutBankTransfer({ planCode });
      set({ isSubmitting: false });
      void get().fetchMySubscription();
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
      void get().fetchMySubscription();
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
