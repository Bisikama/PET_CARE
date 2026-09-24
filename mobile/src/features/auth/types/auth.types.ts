// Based on Mobile API Contract: 01-auth-identity.md

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  data: {
    accessToken: string;
    user: UserProfile;
  };
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password?: string;
  confirmPassword?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
  nonce?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
