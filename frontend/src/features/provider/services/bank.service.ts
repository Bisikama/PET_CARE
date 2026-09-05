import axiosInstance from '@/lib/axios';
import { ProviderBankAccount, CreateBankAccountPayload, UpdateBankAccountPayload } from '../types/bank.types';

export const bankService = {
  /**
   * Lấy danh sách tài khoản ngân hàng của Provider
   */
  getMyBankAccounts: async (): Promise<ProviderBankAccount[]> => {
    const response = await axiosInstance.get('/providers/me/bank-accounts');
    return response.data.data || response.data;
  },

  /**
   * Thêm tài khoản ngân hàng mới
   */
  createBankAccount: async (payload: CreateBankAccountPayload): Promise<ProviderBankAccount> => {
    const response = await axiosInstance.post('/providers/me/bank-accounts', payload);
    return response.data.data || response.data;
  },

  /**
   * Cập nhật tài khoản ngân hàng (ví dụ: đặt làm mặc định)
   */
  updateBankAccount: async (id: string, payload: UpdateBankAccountPayload): Promise<ProviderBankAccount> => {
    const response = await axiosInstance.patch(`/providers/me/bank-accounts/${id}`, payload);
    return response.data.data || response.data;
  },
};
