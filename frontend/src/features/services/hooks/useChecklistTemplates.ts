import { useState, useEffect, useCallback } from 'react';
import { servicesService } from '../services/services.service';
import { ChecklistTemplate, CreateChecklistTemplateData, UpdateChecklistTemplateData } from '../types';

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
      const sorted = (data || []).sort((a, b) => a.sortOrder - b.sortOrder);
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

  const createTemplate = async (data: CreateChecklistTemplateData) => {
    if (!serviceId) throw new Error('Chưa chọn gói dịch vụ');
    setIsLoading(true);
    setError(null);
    try {
      const newTemplate = await servicesService.createChecklistTemplate(serviceId, data);
      setChecklistTemplates((prev) => [...prev, newTemplate].sort((a, b) => a.sortOrder - b.sortOrder));
      return newTemplate;
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể tạo đầu việc checklist mới.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async (templateId: string, data: UpdateChecklistTemplateData) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await servicesService.updateChecklistTemplate(templateId, data);
      setChecklistTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? updated : t)).sort((a, b) => a.sortOrder - b.sortOrder)
      );
      return updated;
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể cập nhật đầu việc checklist.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await servicesService.deleteChecklistTemplate(templateId);
      setChecklistTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể xóa đầu việc checklist này.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checklistTemplates,
    isLoading,
    error,
    refetch: fetchChecklistTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};

