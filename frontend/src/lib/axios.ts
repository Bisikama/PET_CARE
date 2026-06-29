import axios from 'axios';
import { getAuthToken } from './auth';

const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) {
    return 'http://localhost:3000/api';
  }
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Add global error handlers if necessary, e.g. redirecting on 401
    return Promise.reject(error);
  }
);

export default axiosInstance;
