import { apiClient } from './client';

export interface WalletBalanceResponse {
  balance: number;
  pendingBalance: number;
}

export interface WalletTransactionItem {
  id: string;
  wallet_id: string;
  amount: number | string;
  type: 'CREDIT' | 'DEBIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'PAYOUT' | 'REFUND';
  booking_id?: string | null;
  description?: string | null;
  created_at: string;
}

export interface WalletTransactionsResponse {
  data: WalletTransactionItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ProviderBankAccount {
  id: string;
  provider_id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string | null;
  is_default: boolean;
}

export interface PayoutRequestItem {
  id: string;
  provider_id: string;
  amount: number | string;
  status: 'PAYOUT_PENDING' | 'PAYOUT_APPROVED' | 'PAYOUT_REJECTED';
  bank_details: {
    bank_name: string;
    account_number: string;
    account_name: string;
    branch?: string;
  };
  created_at: string;
}

export const walletApi = {
  // Lấy số dư ví (Available & Pending)
  getMyWallet: async (): Promise<WalletBalanceResponse> => {
    try {
      const res = await apiClient.get<any>('/wallets/me');
      const data = res.data?.data || res.data;
      return {
        balance: Number(data?.balance || 0),
        pendingBalance: Number(data?.pendingBalance || 0),
      };
    } catch (err) {
      console.warn('walletApi.getMyWallet error:', err);
      return { balance: 0, pendingBalance: 0 };
    }
  },

  // Lấy lịch sử biến động số dư
  getTransactions: async (page = 1, limit = 20): Promise<WalletTransactionsResponse> => {
    try {
      const res = await apiClient.get<any>('/wallets/me/transactions', {
        params: { page, limit },
      });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        return { data, total: data.length, page, limit };
      }
      return {
        data: Array.isArray(data?.data) ? data.data : [],
        total: Number(data?.total || 0),
        page: Number(data?.page || page),
        limit: Number(data?.limit || limit),
      };
    } catch (err) {
      console.warn('walletApi.getTransactions error:', err);
      return { data: [], total: 0, page, limit };
    }
  },

  // Lấy danh sách tài khoản ngân hàng của đối tác
  getBankAccounts: async (): Promise<ProviderBankAccount[]> => {
    try {
      const res = await apiClient.get<any>('/providers/me/bank-accounts');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) return data;
      return [];
    } catch (err) {
      console.warn('walletApi.getBankAccounts error:', err);
      return [];
    }
  },

  // Thêm tài khoản ngân hàng
  addBankAccount: async (dto: {
    bank_name: string;
    account_number: string;
    account_name: string;
    branch?: string;
    is_default?: boolean;
  }): Promise<ProviderBankAccount | null> => {
    try {
      const res = await apiClient.post<any>('/providers/me/bank-accounts', dto);
      return res.data?.data || res.data;
    } catch (err) {
      console.warn('walletApi.addBankAccount error:', err);
      throw err;
    }
  },

  // Gửi yêu cầu rút tiền
  requestPayout: async (amount: number, bankAccountId: string): Promise<any> => {
    const res = await apiClient.post<any>('/wallets/me/payout-requests', {
      amount,
      bank_account_id: bankAccountId,
    });
    return res.data?.data || res.data;
  },

  // Lấy danh sách yêu cầu rút tiền
  getPayoutRequests: async (page = 1, limit = 20): Promise<PayoutRequestItem[]> => {
    try {
      const res = await apiClient.get<any>('/wallets/me/payout-requests', {
        params: { page, limit },
      });
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch (err) {
      console.warn('walletApi.getPayoutRequests error:', err);
      return [];
    }
  },

  // Nạp tiền thử nghiệm
  topup: async (amount: number): Promise<any> => {
    const res = await apiClient.post<any>('/wallets/me/topup', { amount });
    return res.data?.data || res.data;
  },
};
