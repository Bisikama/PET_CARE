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

  getPetById: async (id: string): Promise<Pet> => {
    const response = await axiosInstance.get<Pet>(`/pets/${id}`);
    return response.data;
  },

  updatePet: async (id: string, formData: FormData): Promise<Pet> => {
    const response = await axiosInstance.put<Pet>(`/pets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePet: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/pets/${id}`);
  },
};
