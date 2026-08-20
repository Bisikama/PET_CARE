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
