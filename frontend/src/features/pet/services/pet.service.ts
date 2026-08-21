import axiosInstance from '@/lib/axios';
import { Pet } from '../types';

export const petService = {
  getPets: async (): Promise<Pet[]> => {
    const response = await axiosInstance.get<Pet[]>('/pets');
    return response.data;
  },

  createPet: async (formData: FormData): Promise<Pet> => {
    const response = await axiosInstance.post<Pet>('/pets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
