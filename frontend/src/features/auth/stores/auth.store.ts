import { create } from 'zustand';
import { getAuthToken, setAuthToken, removeAuthToken } from '@/lib/auth';
import { authService } from '../services/auth.service';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: Record<string, any>) => Promise<boolean>;
  registerUser: (data: Record<string, any>) => Promise<boolean>;
  verifyEmailOtp: (email: string, otp: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: typeof window !== 'undefined' ? getAuthToken() : null,
  isAuthenticated: false,
  isLoading: typeof window !== 'undefined' ? !!getAuthToken() : false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      
      // Store token locally
      setAuthToken(response.accessToken);
      
      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Có lỗi xảy ra trong quá trình đăng nhập.';
      set({
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
        user: null,
        accessToken: null,
      });
      removeAuthToken();
      return false;
    }
  },

  registerUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Call register API
      const registerResponse = await authService.register(data);
      
      // If Backend requires OTP verification, stop here and return true (UI will redirect to /verify-otp)
      if (registerResponse && (registerResponse as any).requiresEmailConfirmation) {
        set({ isLoading: false, error: null });
        return true;
      }

      // 2. Automatically log in after registration (if bypass OTP or if standard sign up config)
      const loginResponse = await authService.login({
        email: data.email,
        password: data.password,
      });

      // 3. Store token locally
      setAuthToken(loginResponse.accessToken);
      
      set({
        user: loginResponse.user,
        accessToken: loginResponse.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Có lỗi xảy ra trong quá trình đăng ký.';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  verifyEmailOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.verifyEmailOtp(email, otp);
      
      // Store token locally
      setAuthToken(response.accessToken);
      
      set({
        user: response.user,
        accessToken: response.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Xác thực OTP không thành công.';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  resendOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resendConfirmationOtp(email);
      set({ isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Gửi lại mã OTP thất bại.';
      set({
        isLoading: false,
        error: errorMessage,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (err) {
      console.error('Lỗi khi đăng xuất ở server:', err);
    } finally {
      removeAuthToken();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  initAuth: async () => {
    let token = getAuthToken();

    if (!token) {
      set({ isLoading: true });
      try {
        const refreshResponse = await authService.refreshToken();
        if (refreshResponse?.accessToken) {
          token = refreshResponse.accessToken;
          setAuthToken(token);
        } else {
          set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, error: null });
          return;
        }
      } catch {
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false, error: null });
        return;
      }
    }

    set({ isLoading: true, accessToken: token });
    try {
      const user = await authService.getMe();
      set({
        user,
        accessToken: getAuthToken(),
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch {
      removeAuthToken();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
