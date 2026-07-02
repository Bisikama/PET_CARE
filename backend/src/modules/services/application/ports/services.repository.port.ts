import {
  ServiceRecord,
  CreateServiceInput,
  UpdateServiceInput,
  PricingRuleRecord,
  CreatePricingRuleInput,
  UpdatePricingRuleInput,
  ChecklistTemplateRecord,
  CreateChecklistTemplateInput,
  UpdateChecklistTemplateInput,
  CancellationPolicyRecord,
  CreateCancellationPolicyInput,
} from '../types/services.types';

export interface IServicesRepository {
  // Service
  createService(data: CreateServiceInput): Promise<ServiceRecord>;
  updateService(id: string, data: UpdateServiceInput): Promise<ServiceRecord>;
  deleteServiceSoft(id: string): Promise<void>;
  findServiceById(id: string): Promise<ServiceRecord | null>;
  findAllServices(): Promise<ServiceRecord[]>;

  // Pricing Rule
  createPricingRule(data: CreatePricingRuleInput): Promise<PricingRuleRecord>;
  updatePricingRule(id: string, data: UpdatePricingRuleInput): Promise<PricingRuleRecord>;
  deletePricingRuleSoft(id: string): Promise<void>;
  findPricingRuleById(id: string): Promise<PricingRuleRecord | null>;
  findPricingRulesByServiceId(serviceId: string): Promise<PricingRuleRecord[]>;

  // Checklist Template
  createChecklistTemplate(data: CreateChecklistTemplateInput): Promise<ChecklistTemplateRecord>;
  updateChecklistTemplate(
    id: string,
    data: UpdateChecklistTemplateInput,
  ): Promise<ChecklistTemplateRecord>;
  deleteChecklistTemplateSoft(id: string): Promise<void>;
  findChecklistTemplateById(id: string): Promise<ChecklistTemplateRecord | null>;
  findChecklistTemplatesByServiceId(serviceId: string): Promise<ChecklistTemplateRecord[]>;

  // Cancellation Policy
  createCancellationPolicy(data: CreateCancellationPolicyInput): Promise<CancellationPolicyRecord>;
  findCancellationPolicyById(id: string): Promise<CancellationPolicyRecord | null>;
  findAllCancellationPolicies(): Promise<CancellationPolicyRecord[]>;
}
