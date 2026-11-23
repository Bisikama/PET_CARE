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

/** Thông tin chuyển khoản VietQR vào tài khoản MB (đối soát tự động qua SePay). */
export interface BankTransferCheckout {
  paymentCode: string;
  amount: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  transferContent: string;
  qrImageUrl: string;
  /** Hết thời gian giữ chỗ (ISO). Chuyển sau mốc này => tiền được hoàn vào ví. */
  expiresAt: string;
}

export const paymentsApi = {
  checkoutBankTransfer: async (dto: CheckoutWalletRequest): Promise<BankTransferCheckout> => {
    const res = await apiClient.post('/payments/checkout-bank-transfer', dto);
    return res.data?.data !== undefined ? res.data.data : res.data;
  },

  getMyWallet: async (): Promise<WalletInfo> => {
    const res = await apiClient.get('/wallets/me');
    const data = res.data?.data !== undefined ? res.data.data : res.data;
    return {
      balance: Number(data?.balance || 0),
      pendingBalance: Number(data?.pendingBalance || 0),
    };
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
