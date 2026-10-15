import axiosInstance from '@/lib/axios';
import { PayoutRequest } from '../types';

export const settlementService = {
  getPayoutRequests: async (): Promise<PayoutRequest[]> => {
    const response = await axiosInstance.get('/admin/settlements/payout-requests');
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray((response.data as any).data)) {
      return (response.data as any).data;
    }
    return [];
  },

  approvePayout: async (id: string): Promise<void> => {
    const response = await axiosInstance.post(`/admin/settlements/payout-requests/${id}/approve`);
    return response.data?.data || response.data;
  },

  rejectPayout: async (id: string, reason?: string): Promise<void> => {
    const response = await axiosInstance.post(`/admin/settlements/payout-requests/${id}/reject`, {
      reason: reason || 'Từ chối bởi Admin',
    });
    return response.data?.data || response.data;
  },

  releaseEscrow: async (bookingId: string): Promise<void> => {
    const response = await axiosInstance.post(`/admin/settlements/payments/${bookingId}/release-escrow`);
    return response.data;
  },

  refundCustomer: async (bookingId: string): Promise<void> => {
    const response = await axiosInstance.post(`/admin/settlements/payments/${bookingId}/refund`);
    return response.data;
  }
};
