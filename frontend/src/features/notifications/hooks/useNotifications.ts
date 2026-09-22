import { useEffect } from 'react';
import { useNotificationStore } from '../stores/notification.store';

export const useNotifications = () => {
  const { notifications, isLoading, error, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, isLoading, error, fetchNotifications };
};
