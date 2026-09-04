import { useState } from 'react';
import { servicesService } from '../services/services.service';
import { CreateChecklistTemplateData, ChecklistTemplate } from '../types';

export const useCreateChecklistTemplate = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChecklistTemplate = async (
    serviceId: string,
    data: CreateChecklistTemplateData
  ): Promise<ChecklistTemplate> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await servicesService.createChecklistTemplate(serviceId, data);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Không thể tạo đầu việc checklist mới.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    createChecklistTemplate,
    submitting,
    error,
  };
};
