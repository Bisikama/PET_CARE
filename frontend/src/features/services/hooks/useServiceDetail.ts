import { useState, useEffect, useCallback } from 'react';
import { servicesService } from '../services/services.service';
import { Service, ChecklistTemplate } from '../types';

export const useServiceDetail = (serviceId: string | null) => {
  const [service, setService] = useState<Service | null>(null);
  const [checklistTemplates, setChecklistTemplates] = useState<ChecklistTemplate[]>([]);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceDetail = useCallback(async () => {
    if (!serviceId) {
      setService(null);
      setChecklistTemplates([]);
      setPricingRules([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [serviceData, templates, rules] = await Promise.all([
        servicesService.getServiceById(serviceId),
        servicesService.getChecklistTemplates(serviceId).catch(() => []),
        servicesService.getPricingRules(serviceId).catch(() => []),
      ]);
      setService(serviceData);
      setChecklistTemplates(templates || []);
      setPricingRules(rules || []);
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
    checklistTemplates,
    pricingRules,
    isLoading,
    error,
    refetch: fetchServiceDetail,
  };
};

