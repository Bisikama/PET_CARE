export interface ServiceRecord {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
  durationMinutes: number;
  isActive: boolean;
  cancellationPolicyId: string | null;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  category?: string;
  basePrice: number;
  durationMinutes: number;
  isActive?: boolean;
  cancellationPolicyId?: string;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  category?: string;
  basePrice?: number;
  durationMinutes?: number;
  isActive?: boolean;
  cancellationPolicyId?: string;
}

export interface PricingRuleRecord {
  id: string;
  serviceId: string;
  petSpecies: string;
  minWeight: number | null;
  maxWeight: number | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreatePricingRuleInput {
  serviceId: string;
  petSpecies: string;
  minWeight?: number;
  maxWeight?: number;
  price: number;
  durationMinutes: number;
  isActive?: boolean;
}

export interface UpdatePricingRuleInput {
  petSpecies?: string;
  minWeight?: number;
  maxWeight?: number;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

export interface ChecklistTemplateRecord {
  id: string;
  serviceId: string;
  title: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreateChecklistTemplateInput {
  serviceId: string;
  title: string;
  description?: string;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface UpdateChecklistTemplateInput {
  title?: string;
  description?: string;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface CancellationPolicyRecord {
  id: string;
  name: string;
  description: string | null;
  rulesJson: any;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateCancellationPolicyInput {
  name: string;
  description?: string;
  rulesJson: any;
  isActive?: boolean;
}
