import { apiClient } from './client';

export interface WalletInfo {
  balance: number;
  pendingBalance: number;
}

export interface CheckoutWalletRequest {
  bookingId: string;
  promotionCode?: string;
}

export interface CheckoutResponse {
  paymentUrl: string;
}

export const paymentsApi = {
  getMyWallet: async (): Promise<WalletInfo> => {
    const res = await apiClient.get('/wallets/me');
    const data = res.data?.data !== undefined ? res.data.data : res.data;
    return {
      balance: Number(data?.balance || 0),
      pendingBalance: Number(data?.pendingBalance || 0),
    };
  },

  topupWallet: async (amount: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post('/wallets/me/topup', { amount });
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  checkoutWithWallet: async (dto: CheckoutWalletRequest): Promise<any> => {
    const res = await apiClient.post('/payments/checkout-wallet', dto);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  checkoutVNPay: async (dto: CheckoutWalletRequest): Promise<CheckoutResponse> => {
    const res = await apiClient.post('/payments/checkout', dto);
    const data = res.data?.data !== undefined ? res.data.data : res.data;
    return data;
  },

  checkoutMoMo: async (dto: CheckoutWalletRequest): Promise<CheckoutResponse> => {
    const res = await apiClient.post('/payments/checkout-momo', dto);
    const data = res.data?.data !== undefined ? res.data.data : res.data;
    return data;
  },
};
