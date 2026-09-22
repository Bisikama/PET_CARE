import { apiClient } from '../../../infrastructure/api/client';
import * as ImageManipulator from 'expo-image-manipulator';
import {
  CreateProviderProfileDto,
  UpdateProviderAddressDto,
  AddServiceAreaDto,
  RegisterCapabilityDto,
  SubmitKycDto,
  ProviderProfileResponse,
  ApiResponse,
  SubmitDocumentsDto,
} from '../types/provider.types';

// Helper to compress images to ensure they are well under 50MB (usually around 1-2MB)
const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Resize width to 1200px max, keeping aspect ratio
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Image compression error:', error);
    return uri; // Return original if compression fails
  }
};

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

    // Compress images
    const frontUri = await compressImage(frontImage.uri);
    const backUri = await compressImage(backImage.uri);
    const faceUri = await compressImage(faceImage.uri);

    formData.append('frontImage', { ...frontImage, uri: frontUri } as any);
    formData.append('backImage', { ...backImage, uri: backUri } as any);
    formData.append('faceImage', { ...faceImage, uri: faceUri } as any);

    const response = await apiClient.post('/providers/kyc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadDocuments: async (
    data: SubmitDocumentsDto
  ): Promise<ApiResponse<null>> => {
    let lastResponse;
    for (let i = 0; i < data.certificateImages.length; i++) {
      const img = data.certificateImages[i];
      const compressedUri = await compressImage(img.uri);
      
      const formData = new FormData();
      formData.append('file', { ...img, uri: compressedUri } as any);
      formData.append('documentType', 'OTHER');

      lastResponse = await apiClient.post('/providers/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    return lastResponse?.data || { success: true, message: 'Success', data: null };
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
