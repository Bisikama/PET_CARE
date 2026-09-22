import axiosInstance from '@/lib/axios';
import { PayoutRequest } from '../types';

export const settlementService = {
  getPayoutRequests: async (): Promise<PayoutRequest[]> => {
    const response = await axiosInstance.get('/admin/settlements/payout-requests');
    return response.data;
  },

  approvePayout: async (id: string): Promise<void> => {
    const response = await axiosInstance.post(`/admin/settlements/payout-requests/${id}/approve`);
    return response.data;
  },

  rejectPayout: async (id: string): Promise<void> => {
    const response = await axiosInstance.post(`/admin/settlements/payout-requests/${id}/reject`);
    return response.data;
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
