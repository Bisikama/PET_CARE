import { useNotificationStore } from '../stores/notification.store';

export const useMarkRead = () => {
  const { markAsRead } = useNotificationStore();
  
  return { markAsRead };
};
