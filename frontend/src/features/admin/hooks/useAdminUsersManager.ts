import { useEffect } from 'react';
import { useAdminStore } from '../stores/admin.store';

export const useAdminUsersManager = () => {
  const {
    adminUsers,
    deactivationRequests,
    systemConfigs,
    isLoading,
    error,
    fetchAdminUsers,
    fetchDeactivationRequests,
    fetchSystemConfigs,
    approveDeactivation,
    rejectDeactivation,
    updateConfigs,
  } = useAdminStore();

  useEffect(() => {
    fetchAdminUsers();
    fetchDeactivationRequests();
    fetchSystemConfigs();
  }, [fetchAdminUsers, fetchDeactivationRequests, fetchSystemConfigs]);

  return {
    adminUsers,
    deactivationRequests,
    systemConfigs,
    isLoading,
    error,
    approveDeactivation,
    rejectDeactivation,
    updateConfigs,
    refetchAll: () => {
      fetchAdminUsers(true);
      fetchDeactivationRequests(true);
      fetchSystemConfigs(true);
    },
  };
};
