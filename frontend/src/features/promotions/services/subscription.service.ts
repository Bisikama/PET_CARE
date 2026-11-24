import axiosInstance from '@/lib/axios';
import type {
  AdminSubscriptionOrderList,
  AdminSubscriptionPlan,
  SubscriptionBankTransferCheckout,
  SubscriptionCheckoutDto,
  SubscriptionOrder,
  SubscriptionOrderStatus,
  SubscriptionPlan,
  SubscriptionPlanInput,
  UserSubscription,
} from '../types/subscription.types';

export const subscriptionService = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await axiosInstance.get<SubscriptionPlan[]>('/subscriptions/plans');
    return response.data ?? [];
  },

  getMySubscription: async (): Promise<UserSubscription | null> => {
    const response = await axiosInstance.get<UserSubscription | null>('/subscriptions/my-subscription');
    return response.data ?? null;
  },

  getMyOrders: async (): Promise<SubscriptionOrder[]> => {
    const response = await axiosInstance.get<SubscriptionOrder[]>('/subscriptions/my-orders');
    return response.data ?? [];
  },

  getMyOrder: async (orderId: string): Promise<SubscriptionOrder> => {
    const response = await axiosInstance.get<SubscriptionOrder>(`/subscriptions/my-orders/${orderId}`);
    return response.data;
  },

  checkoutBankTransfer: async (dto: SubscriptionCheckoutDto): Promise<SubscriptionBankTransferCheckout> => {
    const response = await axiosInstance.post<SubscriptionBankTransferCheckout>(
      '/subscriptions/checkout-bank-transfer',
      dto,
    );
    return response.data;
  },

  checkoutVnPay: async (dto: SubscriptionCheckoutDto): Promise<{ paymentUrl: string; orderId: string }> => {
    const response = await axiosInstance.post<{ paymentUrl: string; orderId: string }>(
      '/subscriptions/checkout-vnpay',
      dto,
    );
    return response.data;
  },

  checkoutWallet: async (dto: SubscriptionCheckoutDto): Promise<{ subscription: UserSubscription | null }> => {
    const response = await axiosInstance.post<{ subscription: UserSubscription | null }>(
      '/subscriptions/checkout-wallet',
      dto,
    );
    return response.data;
  },
};

/** API quản trị gói hội viên (chỉ ADMIN). */
export const adminSubscriptionService = {
  listPlans: async (): Promise<AdminSubscriptionPlan[]> => {
    const response = await axiosInstance.get<AdminSubscriptionPlan[]>('/admin/subscriptions/plans');
    return response.data ?? [];
  },

  createPlan: async (input: SubscriptionPlanInput) => {
    const response = await axiosInstance.post('/admin/subscriptions/plans', input);
    return response.data;
  },

  updatePlan: async (id: string, input: Partial<SubscriptionPlanInput>) => {
    const { code: _code, ...rest } = input;
    const response = await axiosInstance.patch(`/admin/subscriptions/plans/${id}`, rest);
    return response.data;
  },

  listOrders: async (params: {
    status?: SubscriptionOrderStatus | 'ALL';
    planCode?: string;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminSubscriptionOrderList> => {
    const response = await axiosInstance.get<AdminSubscriptionOrderList>('/admin/subscriptions/orders', {
      params: {
        ...params,
        status: params.status && params.status !== 'ALL' ? params.status : undefined,
        planCode: params.planCode || undefined,
        q: params.q || undefined,
      },
    });
    return response.data;
  },
};

/** Lấy thông báo lỗi từ phản hồi backend (NestJS) */
export const getApiErrorMessage = (err: any, fallback: string): string => {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg || err?.message || fallback;
};
