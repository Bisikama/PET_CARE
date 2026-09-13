import { useEffect } from 'react';
import { useNotificationStore } from '../stores/notification.store';

export const useUnreadCount = () => {
  const { unreadCount, isCountLoading, fetchUnreadCount } = useNotificationStore();

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return { unreadCount, isCountLoading, fetchUnreadCount };
};
