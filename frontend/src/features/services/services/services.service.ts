import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  Service,
  ChecklistTemplate,
  CreateServiceData,
  UpdateServiceData,
  PricingRule,
  CreatePricingRuleData,
  UpdatePricingRuleData,
  CreateChecklistTemplateData,
  UpdateChecklistTemplateData,
  CancellationPolicy,
  CreateCancellationPolicyData,
} from '../types';

export const servicesService = {
  getServices: async (): Promise<Service[]> => {
    const response = await axiosInstance.get<Service[]>(API_ENDPOINTS.SERVICES);
    return response.data;
  },

  getServiceById: async (id: string): Promise<Service> => {
    const response = await axiosInstance.get<Service>(`${API_ENDPOINTS.SERVICES}/${id}`);
    return response.data;
  },

  createService: async (data: CreateServiceData): Promise<Service> => {
    const response = await axiosInstance.post<Service>(API_ENDPOINTS.SERVICES, data);
    return response.data;
  },

  updateService: async (id: string, data: UpdateServiceData): Promise<Service> => {
    const response = await axiosInstance.patch<Service>(`${API_ENDPOINTS.SERVICES}/${id}`, data);
    return response.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.SERVICES}/${id}`);
  },

  // Cancellation Policies APIs
  getCancellationPolicies: async (): Promise<CancellationPolicy[]> => {
    const response = await axiosInstance.get<CancellationPolicy[]>('/cancellation-policies');
    return response.data;
  },

  createCancellationPolicy: async (data: CreateCancellationPolicyData): Promise<CancellationPolicy> => {
    const response = await axiosInstance.post<CancellationPolicy>('/cancellation-policies', data);
    return response.data;
  },


  // Pricing Rules APIs
  getPricingRules: async (serviceId: string): Promise<PricingRule[]> => {
    const response = await axiosInstance.get<PricingRule[]>(`${API_ENDPOINTS.SERVICES}/${serviceId}/pricing-rules`);
    return response.data;
  },

  createPricingRule: async (serviceId: string, data: CreatePricingRuleData): Promise<PricingRule> => {
    const response = await axiosInstance.post<PricingRule>(`${API_ENDPOINTS.SERVICES}/${serviceId}/pricing-rules`, data);
    return response.data;
  },

  updatePricingRule: async (ruleId: string, data: UpdatePricingRuleData): Promise<PricingRule> => {
    const response = await axiosInstance.patch<PricingRule>(`${API_ENDPOINTS.SERVICES}/pricing-rules/${ruleId}`, data);
    return response.data;
  },

  deletePricingRule: async (ruleId: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.SERVICES}/pricing-rules/${ruleId}`);
  },

  // Checklist Templates APIs
  getChecklistTemplates: async (serviceId: string): Promise<ChecklistTemplate[]> => {
    const response = await axiosInstance.get<ChecklistTemplate[]>(
      `${API_ENDPOINTS.SERVICES}/${serviceId}/checklist-templates`,
    );
    return response.data;
  },

  createChecklistTemplate: async (
    serviceId: string,
    data: CreateChecklistTemplateData,
  ): Promise<ChecklistTemplate> => {
    const response = await axiosInstance.post<ChecklistTemplate>(
      `${API_ENDPOINTS.SERVICES}/${serviceId}/checklist-templates`,
      data,
    );
    return response.data;
  },

  updateChecklistTemplate: async (
    templateId: string,
    data: UpdateChecklistTemplateData,
  ): Promise<ChecklistTemplate> => {
    const response = await axiosInstance.patch<ChecklistTemplate>(
      `${API_ENDPOINTS.SERVICES}/checklist-templates/${templateId}`,
      data,
    );
    return response.data;
  },

  deleteChecklistTemplate: async (templateId: string): Promise<void> => {
    await axiosInstance.delete(`${API_ENDPOINTS.SERVICES}/checklist-templates/${templateId}`);
  },
};



