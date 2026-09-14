import { apiClient } from '../../../infrastructure/api/client';
import { ApiResponse } from '../../auth/types/auth.types';
import { Address, CreateAddressRequest, UpdateAddressRequest, CalculateDistanceRequest, DistanceResult } from '../types/address.types';

export const addressApi = {
  getAddresses: async (): Promise<ApiResponse<Address[]>> => {
    const response = await apiClient.get('/customer-addresses');
    return response.data;
  },

  getAddress: async (id: string): Promise<ApiResponse<Address>> => {
    const response = await apiClient.get(`/customer-addresses/${id}`);
    return response.data;
  },

  createAddress: async (data: CreateAddressRequest): Promise<ApiResponse<Address>> => {
    const response = await apiClient.post('/customer-addresses', data);
    return response.data;
  },

  updateAddress: async (id: string, data: UpdateAddressRequest): Promise<ApiResponse<Address>> => {
    const response = await apiClient.patch(`/customer-addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/customer-addresses/${id}`);
    return response.data;
  },

  calculateDistance: async (data: CalculateDistanceRequest): Promise<ApiResponse<DistanceResult>> => {
    const response = await apiClient.post('/customer-addresses/calculate-distance', data);
    return response.data;
  },
};
