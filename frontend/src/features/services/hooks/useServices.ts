import { useEffect } from 'react';
import { useServicesStore } from '../stores/services.store';

export const useServices = () => {
  const { services, isLoading, error, fetchServices, clearError } = useServicesStore();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    services,
    isLoading,
    error,
    refreshServices: fetchServices,
    clearError,
  };
};
