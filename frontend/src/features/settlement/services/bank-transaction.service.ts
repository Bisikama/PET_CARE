import axiosInstance from '@/lib/axios';
import type {
  BankTransactionList,
  BankTransactionStatus,
  ResolveBankTransactionInput,
} from '../types';

export const bankTransactionService = {
  /** Sổ giao dịch ngân hàng do SePay báo về (chỉ ADMIN). */
  list: async (params: {
    status?: BankTransactionStatus | 'ALL';
    page?: number;
    limit?: number;
    q?: string;
  }): Promise<BankTransactionList> => {
    const { status, ...rest } = params;
    const response = await axiosInstance.get('/payments/admin/bank-transactions', {
      params: { ...rest, status: status && status !== 'ALL' ? status : undefined, q: rest.q || undefined },
    });
    return response.data;
  },

  /** Xử lý một giao dịch UNMATCHED: gán đơn / hoàn ví khách / đánh dấu đã xử lý ngoài hệ thống. */
  resolve: async (
    id: string,
    input: ResolveBankTransactionInput,
  ): Promise<{ id: string; status: BankTransactionStatus; note?: string }> => {
    const response = await axiosInstance.post(`/payments/admin/bank-transactions/${id}/resolve`, input);
    return response.data;
  },
};
