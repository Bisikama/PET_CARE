import { useEffect } from 'react';
import { useServiceDiscoveryStore } from '../stores/service-discovery.store';

export const useServiceDiscovery = (petId?: string) => {
  const {
    packages,
    recommendations,
    isLoading,
    isSubmitting,
    error,
    fetchPackages,
    fetchRecommendations,
    createSuggestion,
  } = useServiceDiscoveryStore();

  useEffect(() => {
    fetchPackages();
    fetchRecommendations(petId);
  }, [fetchPackages, fetchRecommendations, petId]);

  return {
    packages,
    recommendations,
    isLoading,
    isSubmitting,
    error,
    createSuggestion,
    refetchAll: () => {
      fetchPackages(true);
      fetchRecommendations(petId, true);
    },
  };
};
