import axiosInstance from '@/lib/axios';
import { Wallet, WalletTransaction, PayoutRequest } from '../types/wallet.types';

export interface BaseResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const walletService = {
  /**
   * Lấy thông tin ví của người dùng hiện tại (Available & Pending balance)
   */
  getMyWallet: async (): Promise<Wallet> => {
    const response = await axiosInstance.get('/wallets/me');
    return response.data.data || response.data;
  },

  /**
   * Lấy lịch sử giao dịch (sổ cái) của ví
   */
  getMyTransactions: async (): Promise<WalletTransaction[]> => {
    const response = await axiosInstance.get('/wallets/me/transactions');
    return response.data.data || response.data;
  },

  /**
   * Provider gửi yêu cầu rút tiền về tài khoản ngân hàng
   * @param amount Số tiền muốn rút
   */
  requestProviderPayout: async (amount: number): Promise<PayoutRequest> => {
    const response = await axiosInstance.post('/wallets/me/payout-requests', { amount });
    return response.data.data || response.data;
  },

  /**
   * Lấy danh sách yêu cầu rút tiền của tôi
   */
  getMyPayoutRequests: async (): Promise<PayoutRequest[]> => {
    const response = await axiosInstance.get('/wallets/me/payout-requests');
    return response.data.data || response.data;
  },

  /**
   * Customer gửi yêu cầu rút tiền
   * @param amount Số tiền muốn rút
   */
  requestCustomerPayout: async (amount: number): Promise<PayoutRequest> => {
    const response = await axiosInstance.post('/wallets/me/customer-payout-requests', { amount });
    return response.data.data || response.data;
  },
};
