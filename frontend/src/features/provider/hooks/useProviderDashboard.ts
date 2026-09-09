import { useEffect } from 'react';
import { useProviderStore } from '../stores/provider.store';

export const useProviderDashboard = () => {
  const {
    providerData,
    dashboardData,
    reviews,
    trustScoreLogs,
    capabilities,
    isLoading,
    error,
    fetchProviderMe,
    fetchDashboard,
    fetchReviews,
    fetchTrustScoreLogs,
    fetchCapabilities,
    updateProviderStatus,
  } = useProviderStore();

  useEffect(() => {
    fetchProviderMe();
    fetchDashboard();
    fetchReviews();
    fetchTrustScoreLogs();
    fetchCapabilities();
  }, [fetchProviderMe, fetchDashboard, fetchReviews, fetchTrustScoreLogs, fetchCapabilities]);

  return {
    providerData,
    dashboardData,
    reviews,
    trustScoreLogs,
    capabilities,
    isLoading,
    error,
    updateStatus: updateProviderStatus,
    refetchAll: () => {
      fetchProviderMe();
      fetchDashboard(true);
      fetchReviews(true);
      fetchTrustScoreLogs(true);
      fetchCapabilities(true);
    },
  };
};
