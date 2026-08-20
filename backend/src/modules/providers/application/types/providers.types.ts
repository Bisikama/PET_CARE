import { provider_type, provider_document_type, provider_status } from '@prisma/client';

export interface CreateProviderProfileInput {
  providerType: provider_type;
  bio?: string;
  experienceYears?: number;
}

export interface AddServiceAreaInput {
  city: string;
  district: string;
  ward: string;
}

export interface RegisterCapabilityInput {
  serviceId: string;
  petSpecies: string;
  minWeight: number;
  maxWeight: number;
  price: number;
}

export interface AddDocumentInput {
  documentType: provider_document_type;
  fileUrl: string;
}

export interface ProviderProfileRecord {
  id: string;
  userId: string;
  providerType: provider_type;
  status: provider_status;
  identityCardUrl?: string;
}
