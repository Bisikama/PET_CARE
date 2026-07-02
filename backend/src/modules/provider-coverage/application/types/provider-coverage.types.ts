export interface ProviderServiceAreaRecord {
  id: string;
  providerId: string;
  city: string;
  district: string;
  ward: string;
  isActive: boolean;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface CreateProviderAreaInput {
  city: string;
  district: string;
  ward: string;
  isActive?: boolean;
}

export interface UpdateProviderAreaInput {
  city?: string;
  district?: string;
  ward?: string;
  isActive?: boolean;
}
