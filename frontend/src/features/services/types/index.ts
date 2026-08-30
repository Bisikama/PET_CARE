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
