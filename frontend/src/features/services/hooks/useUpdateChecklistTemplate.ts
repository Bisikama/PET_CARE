import { useState } from 'react';
import { servicesService } from '../services/services.service';
import { UpdateChecklistTemplateData, ChecklistTemplate } from '../types';

export const useUpdateChecklistTemplate = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateChecklistTemplate = async (
    templateId: string,
    data: UpdateChecklistTemplateData
  ): Promise<ChecklistTemplate> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await servicesService.updateChecklistTemplate(templateId, data);
      return result;
    } catch (err: any) {
      const msg = err.message || 'Không thể cập nhật đầu việc checklist.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    updateChecklistTemplate,
    submitting,
    error,
  };
};
