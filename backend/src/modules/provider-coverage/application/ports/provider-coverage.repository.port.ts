import {
  ProviderServiceAreaRecord,
  CreateProviderAreaInput,
  UpdateProviderAreaInput,
} from '../types/provider-coverage.types';

export interface IProviderCoverageRepository {
  createArea(providerId: string, data: CreateProviderAreaInput): Promise<ProviderServiceAreaRecord>;
  updateArea(
    id: string,
    providerId: string,
    data: UpdateProviderAreaInput,
  ): Promise<ProviderServiceAreaRecord>;
  deleteAreaSoft(id: string, providerId: string): Promise<void>;
  findAreaById(id: string): Promise<ProviderServiceAreaRecord | null>;
  findAreasByProviderId(providerId: string): Promise<ProviderServiceAreaRecord[]>;
  checkDuplicate(
    providerId: string,
    city: string,
    district: string,
    ward: string,
  ): Promise<boolean>;
  findProviderProfileByUserId(userId: string): Promise<{ id: string } | null>;
}
