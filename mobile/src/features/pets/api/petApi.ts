import { apiClient } from '../../../infrastructure/api/client';
import { ApiResponse } from '../../auth/types/auth.types';
import { CreatePetRequest, UpdatePetRequest, Pet, MedicalRecord } from '../types/pet.types';

const prepareFormData = (data: Partial<CreatePetRequest>) => {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.species) formData.append('species', data.species);
  if (data.breed) formData.append('breed', data.breed);
  if (data.age) formData.append('age', data.age.toString());
  if (data.weight) formData.append('weight', data.weight.toString());
  if (data.healthNote) formData.append('healthNote', data.healthNote);
  
  if (data.avatar) {
    // React Native FormData expects an object with uri, type, and name for files
    formData.append('avatar', {
      uri: data.avatar.uri,
      type: data.avatar.mimeType || 'image/jpeg',
      name: data.avatar.fileName || `avatar-${Date.now()}.jpg`,
    } as any);
  }
  
  return formData;
};

export const petApi = {
  getPets: async (): Promise<ApiResponse<Pet[]>> => {
    const response = await apiClient.get('/pets');
    return response.data;
  },

  getPet: async (id: string): Promise<ApiResponse<Pet>> => {
    const response = await apiClient.get(`/pets/${id}`);
    return response.data;
  },

  createPet: async (data: CreatePetRequest): Promise<ApiResponse<Pet>> => {
    const formData = prepareFormData(data);
    const response = await apiClient.post('/pets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updatePet: async (id: string, data: UpdatePetRequest): Promise<ApiResponse<Pet>> => {
    const formData = prepareFormData(data);
    const response = await apiClient.put(`/pets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deletePet: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/pets/${id}`);
    return response.data;
  },

  getMedicalRecords: async (petId: string): Promise<ApiResponse<MedicalRecord[]>> => {
    const response = await apiClient.get(`/pets/${petId}/medical-records`);
    return response.data;
  },
};
