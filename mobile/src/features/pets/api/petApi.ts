import { apiClient } from '../../../infrastructure/api/client';
import { CreatePetRequest, UpdatePetRequest, Pet, MedicalRecord } from '../types/pet.types';

const prepareFormData = (data: Partial<CreatePetRequest>) => {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.species) formData.append('species', data.species);
  if (data.breed) formData.append('breed', data.breed);
  if (data.age !== undefined && data.age !== null) formData.append('age', data.age.toString());
  if (data.weight !== undefined && data.weight !== null) formData.append('weight', data.weight.toString());
  if (data.gender) formData.append('gender', data.gender);
  if (data.healthNote) formData.append('healthNote', data.healthNote);
  if (data.behaviorNote) formData.append('behaviorNote', data.behaviorNote);
  if (data.avatarUrl) formData.append('avatarUrl', data.avatarUrl);

  if (data.avatar && data.avatar.uri) {
    formData.append('avatar', {
      uri: data.avatar.uri,
      type: data.avatar.mimeType || 'image/jpeg',
      name: data.avatar.fileName || `pet-avatar-${Date.now()}.jpg`,
    } as any);
  }

  return formData;
};

export const petApi = {
  getPets: async (): Promise<{ success: boolean; data: Pet[]; message?: string }> => {
    try {
      const response = await apiClient.get('/pets');
      const raw = response.data;
      const data: Pet[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      return { success: true, data };
    } catch (error: any) {
      return {
        success: false,
        data: [],
        message: error?.message || 'Không thể tải danh sách thú cưng',
      };
    }
  },

  getPet: async (id: string): Promise<{ success: boolean; data?: Pet; message?: string }> => {
    try {
      const response = await apiClient.get(`/pets/${id}`);
      const data = response.data?.data || response.data;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Không tìm thấy thú cưng' };
    }
  },

  createPet: async (data: CreatePetRequest): Promise<{ success: boolean; data?: Pet; message?: string }> => {
    try {
      const formData = prepareFormData(data);
      const response = await apiClient.post('/pets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const resData = response.data?.data || response.data;
      return { success: true, data: resData };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Không thể tạo hồ sơ thú cưng. Vui lòng thử lại.',
      };
    }
  },

  updatePet: async (id: string, data: UpdatePetRequest): Promise<{ success: boolean; data?: Pet; message?: string }> => {
    try {
      const formData = prepareFormData(data);
      const response = await apiClient.put(`/pets/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const resData = response.data?.data || response.data;
      return { success: true, data: resData };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Không thể cập nhật thú cưng' };
    }
  },

  deletePet: async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await apiClient.delete(`/pets/${id}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error?.message || 'Không thể xóa thú cưng' };
    }
  },

  getMedicalRecords: async (petId: string): Promise<{ success: boolean; data: MedicalRecord[] }> => {
    try {
      const response = await apiClient.get(`/pets/${petId}/medical-records`);
      const raw = response.data;
      const data = Array.isArray(raw) ? raw : raw?.data || [];
      return { success: true, data };
    } catch (error: any) {
      return { success: false, data: [] };
    }
  },
};
