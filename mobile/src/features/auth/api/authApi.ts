import { apiClient } from '../../../infrastructure/api/client';
import {
  AuthResponse,
  RegisterRequest,
  VerifyOtpRequest,
  LoginRequest,
  ApiResponse,
  UserProfile,
  ResendOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  GoogleLoginRequest,
} from '../types/auth.types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/verify-email-otp', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  resendOtp: async (data: ResendOtpRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/resend-confirmation-otp', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const response = await apiClient.patch('/auth/change-password', data);
    return response.data;
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/google/id-token', data);
    return response.data;
  },
};
