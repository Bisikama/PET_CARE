import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { Service, ChecklistTemplate } from '../types';

export const servicesService = {
  getServices: async (): Promise<Service[]> => {
    const response = await axiosInstance.get<Service[]>(API_ENDPOINTS.SERVICES);
    return response.data;
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await axiosInstance.get<Service>(`${API_ENDPOINTS.SERVICES}/${id}`);
    return response.data;
  },

  getChecklistTemplates: async (serviceId: string): Promise<ChecklistTemplate[]> => {
    const response = await axiosInstance.get<ChecklistTemplate[]>(
      `${API_ENDPOINTS.SERVICES}/${serviceId}/checklist-templates`,
    );
    return response.data;
  },
};
