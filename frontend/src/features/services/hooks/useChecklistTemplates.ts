import { useState, useEffect, useCallback } from 'react';
import { servicesService } from '../services/services.service';
import { ChecklistTemplate } from '../types';

export const useChecklistTemplates = (serviceId: string | null) => {
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklistTemplates = useCallback(async () => {
    if (!serviceId) {
      setChecklistTemplates([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesService.getChecklistTemplates(serviceId);
      // Sort by sortOrder
      const sorted = data.sort((a, b) => a.sortOrder - b.sortOrder);
      setChecklistTemplates(sorted);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể tải checklist dịch vụ.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchChecklistTemplates();
  }, [fetchChecklistTemplates]);

  return {
    checklistTemplates,
    isLoading,
    error,
    refetch: fetchChecklistTemplates,
  };
};
