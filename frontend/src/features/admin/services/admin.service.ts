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

  reviewDocument: async (documentId: string, data: { status: 'APPROVED' | 'REJECTED'; rejectReason?: string }): Promise<any> => {
    const response = await axiosInstance.put(`/admin/providers/documents/${documentId}/review`, data);
    return response.data;
  },

  grantBadge: async (providerId: string, data: { badgeCode: string }): Promise<any> => {
    const response = await axiosInstance.post(`/admin/providers/${providerId}/badges`, data);
    return response.data;
  },

  getDashboardStats: async (): Promise<{
    totalUsers: number;
    totalProviders: number;
    totalBookings: number;
    openDisputes: number;
    totalRevenue: number;
  }> => {
    const response = await axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  },

  suspendUser: async (userId: string, reason: string): Promise<any> => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/suspend`, { reason });
    return response.data;
  },

  reactivateUser: async (userId: string): Promise<any> => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/reactivate`);
    return response.data;
  },

  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    action?: string;
    actorId?: string;
    targetType?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    data: any[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const response = await axiosInstance.get('/admin/audit-logs', { params });
    return response.data;
  },

  getUsers: async (params?: any): Promise<any> => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },

  createUser: async (data: any): Promise<any> => {
    const response = await axiosInstance.post('/admin/users', data);
    return response.data;
  },

  getDeactivationRequests: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/admin/users/deactivation-requests');
    return response.data;
  },

  approveDeactivation: async (id: string): Promise<any> => {
    const response = await axiosInstance.patch(`/admin/users/deactivation-requests/${id}/approve`);
    return response.data;
  },

  rejectDeactivation: async (id: string, reason?: string): Promise<any> => {
    const response = await axiosInstance.patch(`/admin/users/deactivation-requests/${id}/reject`, { reason });
    return response.data;
  },

  getUserDetail: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: any): Promise<any> => {
    const response = await axiosInstance.patch(`/admin/users/${id}`, data);
    return response.data;
  },

  updateUserRole: async (id: string, role: string): Promise<any> => {
    const response = await axiosInstance.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  getUserSessions: async (id: string): Promise<any[]> => {
    const response = await axiosInstance.get(`/admin/users/${id}/sessions`);
    return response.data;
  },

  deleteUserSessions: async (id: string): Promise<any> => {
    const response = await axiosInstance.delete(`/admin/users/${id}/sessions`);
    return response.data;
  },

  getConfigs: async (): Promise<any> => {
    const response = await axiosInstance.get('/admin/configs');
    return response.data;
  },

  updateConfigs: async (configs: any): Promise<any> => {
    const response = await axiosInstance.patch('/admin/configs', configs);
    return response.data;
  },
};

