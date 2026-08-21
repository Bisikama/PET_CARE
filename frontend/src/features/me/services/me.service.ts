import axiosInstance from '@/lib/axios';
import { User } from '../types';

export const meService = {
  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  registerProvider: async (data: { providerType: 'SITTER' | 'GROOMER' | 'VET'; bio: string; experienceYears: number }): Promise<any> => {
    const response = await axiosInstance.post('/providers/profile', data);
    return response.data;
  },

  addServiceArea: async (data: { city: string; district: string; ward: string }): Promise<any> => {
    const response = await axiosInstance.post('/providers/areas', data);
    return response.data;
  },

  registerCapability: async (data: { serviceId: string; petSpecies: string; minWeight: number; maxWeight: number }): Promise<any> => {
    const response = await axiosInstance.post('/providers/capabilities', data);
    return response.data;
  },

  uploadDocument: async (documentType: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);
    
    const response = await axiosInstance.post('/providers/documents', formData);
    return response.data;
  },

  getActiveServices: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/services');
    return response.data;
  },
};
