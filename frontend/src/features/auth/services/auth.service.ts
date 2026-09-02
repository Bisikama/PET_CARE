import axiosInstance from '@/lib/axios';
import { LoginResponse, User } from '../types';

export const authService = {
  login: async (credentials: Record<string, any>): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: Record<string, any>): Promise<User> => {
    // Strip phone number to avoid NestJS validation errors (whitelist: true, forbidNonWhitelisted: true)
    const { fullName, email, password } = data;
    const response = await axiosInstance.post<User>('/auth/register', { fullName, email, password });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await axiosInstance.post<{ accessToken: string }>('/auth/refresh');
    return response.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  verifyEmailOtp: async (email: string, otp: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/verify-email-otp', { email, otp });
    return response.data;
  },

  resendConfirmationOtp: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/resend-confirmation-otp', { email });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: Record<string, any>): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },
};
