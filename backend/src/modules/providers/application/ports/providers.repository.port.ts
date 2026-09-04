import { AddDocumentInput, AddServiceAreaInput, CreateProviderProfileInput, ProviderProfileRecord, RegisterCapabilityInput } from '../types/providers.types';

export const PROVIDERS_REPOSITORY = 'PROVIDERS_REPOSITORY';

export interface IProvidersRepository {
  findProfileByUserId(userId: string): Promise<ProviderProfileRecord | null>;
  createProfile(userId: string, data: CreateProviderProfileInput): Promise<ProviderProfileRecord>;
  updateIdentityCardUrl(providerId: string, url: string): Promise<void>;
  addServiceArea(providerId: string, data: AddServiceAreaInput): Promise<void>;
  registerService(providerId: string, data: RegisterCapabilityInput): Promise<void>;
  addDocument(providerId: string, data: AddDocumentInput): Promise<void>;
  deleteDocument(documentId: string): Promise<void>;
  getBasePriceByServiceId(serviceId: string): Promise<number | null>;
}
