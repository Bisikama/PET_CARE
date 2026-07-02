import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IProviderCoverageRepository } from '../../application/ports/provider-coverage.repository.port';
import {
  ProviderServiceAreaRecord,
  CreateProviderAreaInput,
  UpdateProviderAreaInput,
} from '../../application/types/provider-coverage.types';

@Injectable()
export class PrismaProviderCoverageRepository implements IProviderCoverageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createArea(
    providerId: string,
    data: CreateProviderAreaInput,
  ): Promise<ProviderServiceAreaRecord> {
    const record = await this.prisma.provider_service_areas.create({
      data: {
        provider_id: providerId,
        city: data.city,
        district: data.district,
        ward: data.ward,
        is_active: data.isActive ?? true,
      },
    });

    return this.mapArea(record);
  }

  async updateArea(
    id: string,
    providerId: string,
    data: UpdateProviderAreaInput,
  ): Promise<ProviderServiceAreaRecord> {
    const record = await this.prisma.provider_service_areas.update({
      where: { id, provider_id: providerId },
      data: {
        city: data.city,
        district: data.district,
        ward: data.ward,
        is_active: data.isActive,
      },
    });

    return this.mapArea(record);
  }

  async deleteAreaSoft(id: string, providerId: string): Promise<void> {
    await this.prisma.provider_service_areas.update({
      where: { id, provider_id: providerId },
      data: { deleted_at: new Date() },
    });
  }

  async findAreaById(id: string): Promise<ProviderServiceAreaRecord | null> {
    const record = await this.prisma.provider_service_areas.findFirst({
      where: { id, deleted_at: null },
    });
    if (!record) return null;
    return this.mapArea(record);
  }

  async findAreasByProviderId(providerId: string): Promise<ProviderServiceAreaRecord[]> {
    const records = await this.prisma.provider_service_areas.findMany({
      where: { provider_id: providerId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapArea(r));
  }

  async checkDuplicate(
    providerId: string,
    city: string,
    district: string,
    ward: string,
  ): Promise<boolean> {
    const record = await this.prisma.provider_service_areas.findFirst({
      where: {
        provider_id: providerId,
        city,
        district,
        ward,
        deleted_at: null,
      },
    });
    return !!record;
  }

  async findProviderProfileByUserId(userId: string): Promise<{ id: string } | null> {
    return this.prisma.provider_profiles.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
  }

  private mapArea(r: any): ProviderServiceAreaRecord {
    return {
      id: r.id,
      providerId: r.provider_id,
      city: r.city,
      district: r.district,
      ward: r.ward,
      isActive: r.is_active ?? true,
      createdAt: r.created_at,
      deletedAt: r.deleted_at ?? null,
    };
  }
}
