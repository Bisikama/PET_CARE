import axiosInstance from '@/lib/axios';

export interface CheckoutRequest {
  bookingId: string;
  promotionCode?: string;
}

export interface CheckoutResponse {
  paymentUrl: string;
}

export const paymentService = {
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await axiosInstance.post('/payments/checkout', data);
    return response.data;
  },

  checkoutWallet: async (data: CheckoutRequest): Promise<any> => {
    const response = await axiosInstance.post('/payments/checkout-wallet', data);
    return response.data;
  },
};
