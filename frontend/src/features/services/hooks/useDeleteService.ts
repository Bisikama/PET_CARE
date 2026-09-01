import { useState } from 'react';
import { useServicesStore } from '../stores/services.store';

export const useDeleteService = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deleteService: storeDeleteService } = useServicesStore();

  const deleteService = async (id: string): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      await storeDeleteService(id);
    } catch (err: any) {
      const msg = err.message || 'Không thể xóa gói dịch vụ.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    deleteService,
    submitting,
    error,
    setError,
  };
};
