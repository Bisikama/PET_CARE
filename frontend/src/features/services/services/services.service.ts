import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { Service } from '../types';

export const servicesService = {
  getServices: async (): Promise<Service[]> => {
    const response = await axiosInstance.get<Service[]>(API_ENDPOINTS.SERVICES);
    return response.data;
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await axiosInstance.get<Service>(`${API_ENDPOINTS.SERVICES}/${id}`);
    return response.data;
  },
};
