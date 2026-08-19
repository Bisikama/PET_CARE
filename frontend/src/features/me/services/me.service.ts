import axiosInstance from '@/lib/axios';
import { User } from '../types';

export const meService = {
  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },
};
