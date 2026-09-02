import { useState } from 'react';
import { servicesService } from '../services/services.service';
import { CreateCancellationPolicyData, CancellationPolicy } from '../types';

export const useCreateCancellationPolicy = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCancellationPolicy = async (
    data: CreateCancellationPolicyData
  ): Promise<CancellationPolicy> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await servicesService.createCancellationPolicy(data);
      return result;
    } catch (err: any) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể tạo chính sách hủy mới.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    createCancellationPolicy,
    submitting,
    error,
    setError,
  };
};
