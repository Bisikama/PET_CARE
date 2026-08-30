import { useState, useEffect, useCallback } from 'react';
import { servicesService } from '../services/services.service';
import { Service } from '../types';

export const useServiceDetail = (serviceId: string | null) => {
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceDetail = useCallback(async () => {
    if (!serviceId) {
      setService(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesService.getServiceById(serviceId);
      setService(data);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể tải chi tiết dịch vụ.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchServiceDetail();
  }, [fetchServiceDetail]);

  return {
    service,
    isLoading,
    error,
    refetch: fetchServiceDetail,
  };
};
