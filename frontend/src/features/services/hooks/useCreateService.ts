import { useState } from 'react';
import { useServicesStore } from '../stores/services.store';
import { CreateServiceData, Service } from '../types';

export const useCreateService = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createService: storeCreateService } = useServicesStore();

  const createService = async (data: CreateServiceData): Promise<Service> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await storeCreateService(data);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Không thể tạo dịch vụ mới.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    createService,
    submitting,
    error,
    setError,
  };
};
