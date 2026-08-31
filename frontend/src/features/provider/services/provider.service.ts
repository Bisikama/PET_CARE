import axiosInstance from '@/lib/axios';
import { ProviderUser } from '../types';

export const providerService = {
  getProviderMe: async (): Promise<ProviderUser> => {
    const response = await axiosInstance.get<ProviderUser>('/auth/provider/me');
    return response.data;
  },

  getProfile: async (): Promise<any> => {
    const response = await axiosInstance.get('/providers/profile');
    return response.data;
  },

  getDocuments: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/providers/documents');
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<any> => {
    const response = await axiosInstance.delete(`/providers/documents/${documentId}`);
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
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanFile = new File([file], `document.${ext}`, { type: file.type });

    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', cleanFile);
    
    const response = await axiosInstance.post('/providers/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getActiveServices: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/services');
    return response.data;
  },
};
