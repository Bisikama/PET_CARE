import { create } from 'zustand';
import { Notification } from '../types';
import { notificationService } from '../services/notification.service';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isCountLoading: boolean;
  hasFetchedOnce: boolean;
  error: string | null;

  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: (force?: boolean) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isCountLoading: false,
  hasFetchedOnce: false,
  error: null,

  fetchUnreadCount: async () => {
    set({ isCountLoading: true, error: null });
    try {
      const data = await notificationService.getUnreadCount();
      set({ unreadCount: data.count, isCountLoading: false });
    } catch (error: any) {
      set({ isCountLoading: false, error: error.message || 'Failed to fetch unread count' });
      console.error('Failed to fetch unread count', error);
    }
  },

  fetchNotifications: async (force = false) => {
    const { hasFetchedOnce, isLoading } = get();
    if (isLoading || (hasFetchedOnce && !force)) return;
    
    set({ isLoading: true, error: null });
    try {
      const data = await notificationService.getNotifications();
      const notifications = Array.isArray(data) ? data : (data as any).data || [];
      set({ notifications, isLoading: false, hasFetchedOnce: true });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch notifications' });
      console.error('Failed to fetch notifications', error);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => {
        const notif = state.notifications.find(n => n.id === id);
        if (notif && !notif.isRead) {
          return {
            notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
            unreadCount: Math.max(0, state.unreadCount - 1)
          };
        }
        return state;
      });
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read`, error);
    }
  },

  reset: () => set({
    notifications: [],
    unreadCount: 0,
    hasFetchedOnce: false,
    error: null,
  })
}));
