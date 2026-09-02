import { useState } from 'react';
import { useServicesStore } from '../stores/services.store';
import { UpdateServiceData, Service } from '../types';

export const useUpdateService = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateService: storeUpdateService } = useServicesStore();

  const updateService = async (id: string, data: UpdateServiceData): Promise<Service> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await storeUpdateService(id, data);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Không thể cập nhật gói dịch vụ.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    updateService,
    submitting,
    error,
    setError,
  };
};
