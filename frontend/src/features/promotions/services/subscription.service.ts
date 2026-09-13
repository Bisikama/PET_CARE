import axiosInstance from '@/lib/axios';
import { SubscriptionCheckoutDto, UserSubscription } from '../types/subscription.types';

export const subscriptionService = {
  getMySubscription: async (): Promise<UserSubscription | null> => {
    const response = await axiosInstance.get<UserSubscription>('/subscriptions/my-subscription');
    return response.data;
  },

  checkoutVnPay: async (dto: SubscriptionCheckoutDto): Promise<{ paymentUrl: string }> => {
    const response = await axiosInstance.post<{ paymentUrl: string }>('/subscriptions/checkout-vnpay', dto);
    return response.data;
  },

  checkoutWallet: async (dto: SubscriptionCheckoutDto): Promise<UserSubscription> => {
    const response = await axiosInstance.post<UserSubscription>('/subscriptions/checkout-wallet', dto);
    return response.data;
  },
};
