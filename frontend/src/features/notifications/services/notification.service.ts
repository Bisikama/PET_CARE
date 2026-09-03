import axiosInstance from '@/lib/axios';
import { Notification, UnreadCountResponse } from '../types';

export const notificationService = {
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  getNotifications: async (): Promise<Notification[]> => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    const response = await axiosInstance.patch('/notifications/read-all');
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },
};
