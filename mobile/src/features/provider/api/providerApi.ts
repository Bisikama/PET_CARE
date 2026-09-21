import { apiClient } from '../../../infrastructure/api/client';
import {
  CreateProviderProfileDto,
  UpdateProviderAddressDto,
  AddServiceAreaDto,
  RegisterCapabilityDto,
  SubmitKycDto,
  ProviderProfileResponse,
  ApiResponse,
} from '../types/provider.types';

export const providerApi = {
  createProfile: async (data: CreateProviderProfileDto): Promise<ApiResponse<ProviderProfileResponse>> => {
    const response = await apiClient.post('/providers/profile', data);
    return response.data;
  },

  updateBaseAddress: async (data: UpdateProviderAddressDto): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/providers/base-address', data);
    return response.data;
  },

  uploadKyc: async (
    data: SubmitKycDto,
    frontImage: { uri: string; type: string; name: string },
    backImage: { uri: string; type: string; name: string },
    faceImage: { uri: string; type: string; name: string }
  ): Promise<ApiResponse<null>> => {
    const formData = new FormData();
    formData.append('idNumber', data.idNumber);
    formData.append('fullName', data.fullName);
    formData.append('dob', data.dob);
    formData.append('issueDate', data.issueDate);

    formData.append('frontImage', frontImage as any);
    formData.append('backImage', backImage as any);
    formData.append('faceImage', faceImage as any);

    const response = await apiClient.post('/providers/kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  addServiceArea: async (data: AddServiceAreaDto): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/providers/areas', data);
    return response.data;
  },

  registerCapability: async (data: RegisterCapabilityDto): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/providers/capabilities', data);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<ProviderProfileResponse>> => {
    const response = await apiClient.get('/providers/profile');
    return response.data;
  },
};
