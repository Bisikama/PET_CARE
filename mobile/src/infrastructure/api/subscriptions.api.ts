import { apiClient } from './client';

/** Gói hội viên đang mở bán (giá do admin cấu hình). */
export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface MySubscription {
  id: string;
  planCode: string;
  planName: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startsAt: string;
  currentPeriodEndsAt: string;
  /** Hết hạn sau cùng, đã tính các kỳ gia hạn trả trước */
  expiresAt: string;
}

export type SubscriptionOrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type SubscriptionPaymentMethod = 'BANK_TRANSFER' | 'VNPAY' | 'WALLET';

export interface SubscriptionOrder {
  id: string;
  planCode: string;
  planName: string;
  amount: number;
  durationDays: number;
  method: SubscriptionPaymentMethod;
  status: SubscriptionOrderStatus;
  paymentCode: string;
  transferContent: string | null;
  paidAt: string | null;
  createdAt: string;
}

/** Thông tin chuyển khoản VietQR khi mua gói. Nội dung CK: "PC… Thanh toan goi <MÃ GÓI>". */
export interface SubscriptionBankTransferCheckout {
  orderId: string;
  planCode: string;
  planName: string;
  durationDays: number;
  paymentCode: string;
  amount: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrImageUrl: string;
}

const unwrap = <T>(res: { data: any }): T => (res.data?.data !== undefined ? res.data.data : res.data);

export const subscriptionsApi = {
  getPlans: async (): Promise<SubscriptionPlan[]> =>
    unwrap<SubscriptionPlan[]>(await apiClient.get('/subscriptions/plans')) ?? [],

  getMySubscription: async (): Promise<MySubscription | null> =>
    unwrap<MySubscription | null>(await apiClient.get('/subscriptions/my-subscription')) ?? null,

  getMyOrders: async (): Promise<SubscriptionOrder[]> =>
    unwrap<SubscriptionOrder[]>(await apiClient.get('/subscriptions/my-orders')) ?? [],

  getMyOrder: async (orderId: string): Promise<SubscriptionOrder> =>
    unwrap<SubscriptionOrder>(await apiClient.get(`/subscriptions/my-orders/${orderId}`)),

  checkoutBankTransfer: async (planCode: string): Promise<SubscriptionBankTransferCheckout> =>
    unwrap<SubscriptionBankTransferCheckout>(
      await apiClient.post('/subscriptions/checkout-bank-transfer', { planCode }),
    ),

  checkoutVnpay: async (planCode: string): Promise<{ paymentUrl: string; orderId: string }> =>
    unwrap<{ paymentUrl: string; orderId: string }>(
      await apiClient.post('/subscriptions/checkout-vnpay', { planCode }),
    ),

  checkoutWallet: async (planCode: string): Promise<{ subscription: MySubscription | null }> =>
    unwrap<{ subscription: MySubscription | null }>(
      await apiClient.post('/subscriptions/checkout-wallet', { planCode }),
    ),
};
