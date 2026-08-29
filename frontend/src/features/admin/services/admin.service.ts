import axiosInstance from '@/lib/axios';

export const adminService = {
  getProviders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    kycStatus?: string;
    screeningStatus?: string;
  }): Promise<any> => {
    const response = await axiosInstance.get('/admin/providers', { params });
    return response.data;
  },

  reviewBulkKyc: async (providerId: string, data: { status: 'APPROVED' | 'REJECTED'; rejectReason?: string }): Promise<any> => {
    const response = await axiosInstance.put(`/admin/providers/${providerId}/kyc-review`, data);
    return response.data;
  },

  approveProvider: async (providerId: string): Promise<any> => {
    const response = await axiosInstance.put(`/admin/providers/${providerId}/approve`);
    return response.data;
  },

  rejectProvider: async (providerId: string, reason: string): Promise<any> => {
    const response = await axiosInstance.put(`/admin/providers/${providerId}/reject`, { reason });
    return response.data;
  },

  updateScreening: async (providerId: string, screeningStatus: 'PASSED' | 'FAILED' | 'PENDING'): Promise<any> => {
    const response = await axiosInstance.put(`/admin/providers/${providerId}/screening`, { screeningStatus });
    return response.data;
  },

  getProviderDocuments: async (providerId: string): Promise<any[]> => {
    const response = await axiosInstance.get(`/admin/providers/${providerId}/documents`);
    return response.data;
  },
};
