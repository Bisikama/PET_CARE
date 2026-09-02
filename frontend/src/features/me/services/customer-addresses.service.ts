import axiosInstance from '@/lib/axios';
import { CustomerAddress, CreateAddressInput, UpdateAddressInput } from '../types';

export const customerAddressesService = {
  createAddress: async (data: CreateAddressInput): Promise<CustomerAddress> => {
    const response = await axiosInstance.post<CustomerAddress>('/customer-addresses', data);
    return response.data;
  },

  getAddresses: async (): Promise<CustomerAddress[]> => {
    const response = await axiosInstance.get<CustomerAddress[]>('/customer-addresses');
    return response.data;
  },

  getAddressById: async (id: string): Promise<CustomerAddress> => {
    const response = await axiosInstance.get<CustomerAddress>(`/customer-addresses/${id}`);
    return response.data;
  },

  updateAddress: async (id: string, data: UpdateAddressInput): Promise<CustomerAddress> => {
    const response = await axiosInstance.patch<CustomerAddress>(`/customer-addresses/${id}`, data);
    return response.data;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/customer-addresses/${id}`);
  },
};
