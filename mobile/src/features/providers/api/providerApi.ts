import { apiClient } from '../../../infrastructure/api/client';
import { ApiResponse } from '../../auth/types/auth.types';
import { ProviderScheduleSlot, ProviderReview } from '../types/provider.types';

export const providerApi = {
  getAvailableSlots: async (providerId: string): Promise<ApiResponse<ProviderScheduleSlot[]>> => {
    const response = await apiClient.get(`/provider-schedules/available-slots/${providerId}`);
    return response.data;
  },

  getProviderReviews: async (providerId: string): Promise<ApiResponse<ProviderReview[]>> => {
    const response = await apiClient.get(`/customer-care/providers/${providerId}/reviews`);
    return response.data;
  },
};
