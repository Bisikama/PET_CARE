import { apiClient } from '../../../infrastructure/api/client';
import { ApiResponse } from '../../auth/types/auth.types';
import { BookingSearchRequest, ProviderSearchResult } from '../types/explore.types';

export const exploreApi = {
  searchProviders: async (data: BookingSearchRequest): Promise<ApiResponse<ProviderSearchResult[]>> => {
    const response = await apiClient.post('/booking-matching/search', data);
    return response.data;
  },
};
