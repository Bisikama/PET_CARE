import axiosInstance from '@/lib/axios';
import { User } from '../types';
import hcmcData from '../data/hcmc-divisions.json';

export const meService = {
  getProvinces: async (): Promise<any[]> => {
    // Return local, fully updated HCMC-only divisions database (post-2025 sáp nhập)
    return hcmcData;
  },
  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: { fullName?: string; phone?: string }): Promise<any> => {
    const response = await axiosInstance.patch('/users/me', data);
    return response.data;
  },

  updateAvatar: async (file: File): Promise<any> => {
    const formData = new FormData();
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanFile = new File([file], `avatar.${ext}`, { type: file.type });
    formData.append('file', cleanFile);

    const response = await axiosInstance.patch('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  registerProvider: async (data: { providerType: 'SITTER' | 'GROOMER' | 'VET'; bio: string; experienceYears: number }): Promise<any> => {
    const response = await axiosInstance.post('/providers/profile', data);
    return response.data;
  },

  updateBaseAddress: async (data: {
    baseAddressLine: string;
    baseLatitude: number;
    baseLongitude: number;
    baseFormatted?: string;
    serviceRadiusKm?: number;
  }): Promise<any> => {
    const response = await axiosInstance.post('/providers/base-address', data);
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

  submitKyc: async (
    data: { idNumber: string; fullName: string; dob: string; issueDate: string },
    files: { frontImage: File; backImage: File; faceImage: File }
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('idNumber', data.idNumber);
    formData.append('fullName', data.fullName);
    formData.append('dob', data.dob);
    formData.append('issueDate', data.issueDate);
    
    // Clean filenames to prevent Supabase Unicode/encoding key issues
    const frontExt = files.frontImage.name.split('.').pop() || 'jpg';
    const backExt = files.backImage.name.split('.').pop() || 'jpg';
    const faceExt = files.faceImage.name.split('.').pop() || 'jpg';

    const cleanFront = new File([files.frontImage], `front-image.${frontExt}`, { type: files.frontImage.type });
    const cleanBack = new File([files.backImage], `back-image.${backExt}`, { type: files.backImage.type });
    const cleanFace = new File([files.faceImage], `face-image.${faceExt}`, { type: files.faceImage.type });

    formData.append('frontImage', cleanFront);
    formData.append('backImage', cleanBack);
    formData.append('faceImage', cleanFace);

    const response = await axiosInstance.post('/providers/kyc', formData, {
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
