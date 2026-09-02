export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
  durationMinutes: number;
  isActive: boolean;
  cancellationPolicyId: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface CreateServiceData {
  name: string;
  description?: string | null;
  category?: string | null;
  basePrice: number;
  durationMinutes: number;
  isActive?: boolean;
  cancellationPolicyId?: string | null;
}

export interface UpdateServiceData {
  name?: string;
  description?: string | null;
  category?: string | null;
  basePrice?: number;
  durationMinutes?: number;
  isActive?: boolean;
  cancellationPolicyId?: string | null;
}


export interface ChecklistTemplate {
  id: string;
  serviceId: string;
  title: string;
  description: string | null;
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
  deletedAt: string | null;
}

export interface CreateChecklistTemplateData {
  title: string;
  description?: string | null;
  isRequired?: boolean;
  sortOrder?: number;
}

export interface UpdateChecklistTemplateData {
  title?: string;
  description?: string | null;
  isRequired?: boolean;
  sortOrder?: number;
}


export interface PricingRule {
  id: string;
  serviceId: string;
  petSpecies: string;
  minWeight: number | null;
  maxWeight: number | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreatePricingRuleData {
  petSpecies: string;
  minWeight?: number | null;
  maxWeight?: number | null;
  price: number;
  durationMinutes: number;
  isActive?: boolean;
}

export interface UpdatePricingRuleData {
  petSpecies?: string;
  minWeight?: number | null;
  maxWeight?: number | null;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

export interface CancellationPolicy {
  id: string;
  name: string;
  description: string | null;
  rulesJson: any;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCancellationPolicyData {
  name: string;
  description?: string | null;
  rulesJson: any;
  isActive?: boolean;
}



