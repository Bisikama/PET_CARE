import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IProvidersRepository } from '../../application/ports/providers.repository.port';
import { AddDocumentInput, AddServiceAreaInput, CreateProviderProfileInput, ProviderProfileRecord, RegisterCapabilityInput } from '../../application/types/providers.types';

@Injectable()
export class PrismaProvidersRepository implements IProvidersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileByUserId(userId: string): Promise<ProviderProfileRecord | null> {
    const profile = await this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
    });
    if (!profile) return null;
    return {
      id: profile.id,
      userId: profile.user_id,
      providerType: profile.provider_type,
      status: profile.status,
      kycStatus: profile.kyc_status,
      identityCardUrl: profile.identity_card_url || undefined,
    };
  }

  async createProfile(userId: string, data: CreateProviderProfileInput): Promise<ProviderProfileRecord> {
    const profile = await this.prisma.provider_profiles.create({
      data: {
        user_id: userId,
        provider_type: data.providerType,
        bio: data.bio,
        experience_years: data.experienceYears,
      },
    });
    return {
      id: profile.id,
      userId: profile.user_id,
      providerType: profile.provider_type,
      status: profile.status,
      kycStatus: profile.kyc_status,
    };
  }

  async updateIdentityCardUrl(providerId: string, url: string): Promise<void> {
    await this.prisma.provider_profiles.update({
      where: { id: providerId },
      data: { identity_card_url: url },
    });
  }

  async addServiceArea(providerId: string, data: AddServiceAreaInput): Promise<void> {
    await this.prisma.provider_service_areas.create({
      data: {
        provider_id: providerId,
        city: data.city,
        district: data.district,
        ward: data.ward,
      },
    });
  }

  async registerService(providerId: string, data: RegisterCapabilityInput): Promise<void> {
    const profile = await this.prisma.provider_profiles.findUnique({
      where: { id: providerId },
      select: { status: true },
    });

    const capabilityStatus = profile?.status === 'APPROVED' ? 'APPROVED' : 'PENDING';

    await this.prisma.provider_services.create({
      data: {
        provider_id: providerId,
        service_id: data.serviceId,
        pet_species: data.petSpecies,
        min_weight: data.minWeight,
        max_weight: data.maxWeight,
        price: data.price,
        status: capabilityStatus as any,
      },
    });
  }

  async addDocument(providerId: string, data: AddDocumentInput): Promise<void> {
    await this.prisma.provider_documents.create({
      data: {
        provider_id: providerId,
        document_type: data.documentType,
        file_url: data.fileUrl,
      },
    });
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.prisma.provider_documents.delete({
      where: { id: documentId },
    });
  }

  async getBasePriceByServiceId(serviceId: string): Promise<number | null> {
    const service = await this.prisma.services.findUnique({
      where: { id: serviceId },
      select: { base_price: true },
    });
    return service ? Number(service.base_price) : null;
  }
}
