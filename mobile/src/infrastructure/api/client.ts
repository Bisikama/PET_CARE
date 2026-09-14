import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Set base URL from env or fallback to local IP for simulator
// Important: For Android emulator, use 10.0.2.2. For iOS simulator or web, localhost works,
// but for a physical device you need your actual local IP.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:3000'; // Replace with actual default

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true, // Needed for HttpOnly refresh token cookie
});

// Storage keys
export const TOKEN_KEY = 'petcare_access_token';

// In-memory token to avoid reading from secure store on every request
let accessToken: string | null = null;

// Helpers
export const setAccessToken = async (token: string) => {
  accessToken = token;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getAccessToken = async () => {
  if (accessToken) return accessToken;
  accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return accessToken;
};

export const clearAuth = async () => {
  accessToken = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

// Request Interceptor: Attach Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh Token Concurrency Lock
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Global Error Handling & Refresh Logic
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle Network Errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        statusCode: 0,
        message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng.',
      });
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized with Refresh Token Concurrency
    if (status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== '/auth/refresh' && originalRequest.url !== '/auth/login') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token via cookie
        const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        const newAccessToken = refreshResponse.data.data.accessToken; // Assumes backend structure returns it here
        await setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearAuth();
        // Here we could dispatch an event to force logout in the UI, or simply let the rejected promise hit the hook which logs out.
        return Promise.reject({
          success: false,
          statusCode: 401,
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        });
      } finally {
        isRefreshing = false;
      }
    }

    // Normalize error format based on PetCare Contract
    const normalizedError = {
      success: false,
      statusCode: status,
      message: (data as any)?.message || error.message,
      error: (data as any)?.error || null,
      timestamp: (data as any)?.timestamp || new Date().toISOString(),
      path: (data as any)?.path || originalRequest.url,
    };

    return Promise.reject(normalizedError);
  }
);
