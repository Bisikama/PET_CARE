import axiosInstance from '@/lib/axios';
import { ServiceArea, CreateAreaDto, UpdateAreaDto } from '../types';

export const areaService = {
  getAreas: async (): Promise<ServiceArea[]> => {
    const response = await axiosInstance.get('/provider-service-areas');
    return response.data;
  },

  createArea: async (data: CreateAreaDto): Promise<ServiceArea> => {
    const response = await axiosInstance.post('/provider-service-areas', data);
    return response.data;
  },

  updateArea: async (id: string, data: UpdateAreaDto): Promise<ServiceArea> => {
    const response = await axiosInstance.patch(`/provider-service-areas/${id}`, data);
    return response.data;
  },

  deleteArea: async (id: string): Promise<void> => {
    const response = await axiosInstance.delete(`/provider-service-areas/${id}`);
    return response.data;
  }
};
