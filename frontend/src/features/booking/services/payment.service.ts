import axiosInstance from '@/lib/axios';

export interface CheckoutRequest {
  bookingId: string;
  promotionCode?: string;
  promoCode?: string;
  amount?: number;
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

export const paymentService = {
  checkoutBankTransfer: async (data: { bookingId: string; promotionCode?: string }): Promise<BankTransferCheckout> => {
    const response = await axiosInstance.post('/payments/checkout-bank-transfer', data);
    return response.data?.data ?? response.data;
  },

  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await axiosInstance.post('/payments/checkout', data);
    return response.data;
  },

  checkoutWallet: async (data: CheckoutRequest): Promise<any> => {
    const response = await axiosInstance.post('/payments/checkout-wallet', data);
    return response.data;
  },

  checkoutMomo: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await axiosInstance.post('/payments/checkout-momo', data);
    return response.data;
  },

  verifyVNPay: async (queryString: string): Promise<any> => {
    const response = await axiosInstance.get(`/payments/vnpay-return${queryString}`);
    return response.data;
  },

  triggerVnpayIpn: async (queryString: string): Promise<any> => {
    const response = await axiosInstance.get(`/payments/vnpay-ipn${queryString}`);
    return response.data;
  },
};
