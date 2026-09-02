import { useState, useEffect, useCallback } from 'react';
import { servicesService } from '../services/services.service';
import { CancellationPolicy } from '../types';

export const useCancellationPolicies = (enabled: boolean = true) => {
  const [cancellationPolicies, setCancellationPolicies] = useState<CancellationPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesService.getCancellationPolicies();
      setCancellationPolicies(data || []);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể tải danh sách chính sách hủy.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    cancellationPolicies,
    isLoading,
    error,
    refetch: fetchPolicies,
  };
};
