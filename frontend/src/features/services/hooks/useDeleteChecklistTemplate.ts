import { useState } from 'react';
import { servicesService } from '../services/services.service';

export const useDeleteChecklistTemplate = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteChecklistTemplate = async (templateId: string): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      await servicesService.deleteChecklistTemplate(templateId);
    } catch (err: any) {
      const msg = err.message || 'Không thể xóa đầu việc checklist.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    deleteChecklistTemplate,
    submitting,
    error,
  };
};
