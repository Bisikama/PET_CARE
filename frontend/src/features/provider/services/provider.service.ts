import axiosInstance from '@/lib/axios';
import { ProviderUser } from '../types';

export const providerService = {
  getProviderMe: async (): Promise<ProviderUser> => {
    const response = await axiosInstance.get<ProviderUser>('/auth/provider/me');
    return response.data;
  },
};
