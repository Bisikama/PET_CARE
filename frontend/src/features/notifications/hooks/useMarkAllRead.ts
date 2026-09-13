import { useNotificationStore } from '../stores/notification.store';

export const useMarkAllRead = () => {
  const { markAllAsRead } = useNotificationStore();
  
  return { markAllAsRead };
};
