import { useMeStore } from '../stores/me.store';

export const useUserSettings = () => {
  const {
    user,
    notificationSettings,
    isLoading,
    error,
    fetchUserMe,
    updateNotificationSettings,
    deleteAccount,
    deactivateAccount,
  } = useMeStore();

  return {
    user,
    notificationSettings,
    isLoading,
    error,
    fetchUserMe,
    updateNotificationSettings,
    deleteAccount,
    deactivateAccount,
  };
};
