import { useState, useEffect, useCallback } from 'react';
import { servicesService } from '../services/services.service';
import { PricingRule, CreatePricingRuleData, UpdatePricingRuleData } from '../types';

export const usePricingRules = (serviceId: string | null) => {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPricingRules = useCallback(async () => {
    if (!serviceId) {
      setPricingRules([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await servicesService.getPricingRules(serviceId);
      setPricingRules(data || []);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể tải bảng giá dịch vụ.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchPricingRules();
  }, [fetchPricingRules]);

  const createRule = async (data: CreatePricingRuleData) => {
    if (!serviceId) throw new Error('Chưa chọn gói dịch vụ');
    setIsLoading(true);
    setError(null);
    try {
      const newRule = await servicesService.createPricingRule(serviceId, data);
      setPricingRules((prev) => [...prev, newRule]);
      return newRule;
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể tạo quy tắc giá mới.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRule = async (ruleId: string, data: UpdatePricingRuleData) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedRule = await servicesService.updatePricingRule(ruleId, data);
      setPricingRules((prev) => prev.map((rule) => (rule.id === ruleId ? updatedRule : rule)));
      return updatedRule;
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể cập nhật quy tắc giá.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await servicesService.deletePricingRule(ruleId);
      setPricingRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        errorResponse?.response?.data?.message || errorResponse?.message || 'Không thể xóa quy tắc giá này.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pricingRules,
    isLoading,
    error,
    refetch: fetchPricingRules,
    createRule,
    updateRule,
    deleteRule,
  };
};
