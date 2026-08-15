import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IServicesRepository } from '../../application/ports/services.repository.port';
import {
  ServiceRecord,
  CreateServiceInput,
  UpdateServiceInput,
  PricingRuleRecord,
  CreatePricingRuleInput,
  UpdatePricingRuleInput,
  ChecklistTemplateRecord,
  CreateChecklistTemplateInput,
  UpdateChecklistTemplateInput,
  CancellationPolicyRecord,
  CreateCancellationPolicyInput,
} from '../../application/types/services.types';

@Injectable()
export class PrismaServicesRepository implements IServicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // SERVICE
  // ==========================================

  async createService(data: CreateServiceInput): Promise<ServiceRecord> {
    const record = await this.prisma.services.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        category: data.category ?? null,
        base_price: data.basePrice,
        duration_minutes: data.durationMinutes,
        is_active: data.isActive ?? true,
        cancellation_policy_id: data.cancellationPolicyId ?? null,
      },
    });

    return this.mapService(record);
  }

  async updateService(id: string, data: UpdateServiceInput): Promise<ServiceRecord> {
    const record = await this.prisma.services.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        base_price: data.basePrice,
        duration_minutes: data.durationMinutes,
        is_active: data.isActive,
        cancellation_policy_id: data.cancellationPolicyId,
      },
    });

    return this.mapService(record);
  }

  async deleteServiceSoft(id: string): Promise<void> {
    await this.prisma.services.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findServiceById(id: string): Promise<ServiceRecord | null> {
    const record = await this.prisma.services.findFirst({
      where: { id, deleted_at: null },
    });
    if (!record) return null;
    return this.mapService(record);
  }

  async findAllServices(): Promise<ServiceRecord[]> {
    const records = await this.prisma.services.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapService(r));
  }

  // ==========================================
  // PRICING RULE
  // ==========================================

  async createPricingRule(data: CreatePricingRuleInput): Promise<PricingRuleRecord> {
    const record = await this.prisma.service_pricing_rules.create({
      data: {
        service_id: data.serviceId,
        pet_species: data.petSpecies,
        min_weight: data.minWeight ?? null,
        max_weight: data.maxWeight ?? null,
        price: data.price,
        duration_minutes: data.durationMinutes,
        is_active: data.isActive ?? true,
      },
    });

    return this.mapPricingRule(record);
  }

  async updatePricingRule(id: string, data: UpdatePricingRuleInput): Promise<PricingRuleRecord> {
    const record = await this.prisma.service_pricing_rules.update({
      where: { id },
      data: {
        pet_species: data.petSpecies,
        min_weight: data.minWeight,
        max_weight: data.maxWeight,
        price: data.price,
        duration_minutes: data.durationMinutes,
        is_active: data.isActive,
      },
    });

    return this.mapPricingRule(record);
  }

  async deletePricingRuleSoft(id: string): Promise<void> {
    await this.prisma.service_pricing_rules.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findPricingRuleById(id: string): Promise<PricingRuleRecord | null> {
    const record = await this.prisma.service_pricing_rules.findFirst({
      where: { id, deleted_at: null },
    });
    if (!record) return null;
    return this.mapPricingRule(record);
  }

  async findPricingRulesByServiceId(serviceId: string): Promise<PricingRuleRecord[]> {
    const records = await this.prisma.service_pricing_rules.findMany({
      where: { service_id: serviceId, deleted_at: null },
      orderBy: { min_weight: 'asc' },
    });
    return records.map((r) => this.mapPricingRule(r));
  }

  // ==========================================
  // CHECKLIST TEMPLATE
  // ==========================================

  async createChecklistTemplate(
    data: CreateChecklistTemplateInput,
  ): Promise<ChecklistTemplateRecord> {
    const record = await this.prisma.service_checklist_templates.create({
      data: {
        service_id: data.serviceId,
        title: data.title,
        description: data.description ?? null,
        is_required: data.isRequired ?? true,
        sort_order: data.sortOrder ?? 0,
      },
    });

    return this.mapChecklistTemplate(record);
  }

  async updateChecklistTemplate(
    id: string,
    data: UpdateChecklistTemplateInput,
  ): Promise<ChecklistTemplateRecord> {
    const record = await this.prisma.service_checklist_templates.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        is_required: data.isRequired,
        sort_order: data.sortOrder,
      },
    });

    return this.mapChecklistTemplate(record);
  }

  async deleteChecklistTemplateSoft(id: string): Promise<void> {
    await this.prisma.service_checklist_templates.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findChecklistTemplateById(id: string): Promise<ChecklistTemplateRecord | null> {
    const record = await this.prisma.service_checklist_templates.findFirst({
      where: { id, deleted_at: null },
    });
    if (!record) return null;
    return this.mapChecklistTemplate(record);
  }

  async findChecklistTemplatesByServiceId(serviceId: string): Promise<ChecklistTemplateRecord[]> {
    const records = await this.prisma.service_checklist_templates.findMany({
      where: { service_id: serviceId, deleted_at: null },
      orderBy: { sort_order: 'asc' },
    });
    return records.map((r) => this.mapChecklistTemplate(r));
  }

  // ==========================================
  // CANCELLATION POLICY
  // ==========================================

  async createCancellationPolicy(
    data: CreateCancellationPolicyInput,
  ): Promise<CancellationPolicyRecord> {
    const record = await this.prisma.cancellation_policies.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        rules_json: data.rulesJson,
        is_active: data.isActive ?? true,
      },
    });

    return this.mapCancellationPolicy(record);
  }

  async findCancellationPolicyById(id: string): Promise<CancellationPolicyRecord | null> {
    const record = await this.prisma.cancellation_policies.findFirst({
      where: { id, is_active: true },
    });
    if (!record) return null;
    return this.mapCancellationPolicy(record);
  }

  async findAllCancellationPolicies(): Promise<CancellationPolicyRecord[]> {
    const records = await this.prisma.cancellation_policies.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapCancellationPolicy(r));
  }

  // ==========================================
  // MAPPER HELPERS
  // ==========================================

  private mapService(r: any): ServiceRecord {
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      basePrice: Number(r.base_price),
      durationMinutes: r.duration_minutes,
      isActive: r.is_active ?? true,
      cancellationPolicyId: r.cancellation_policy_id,
      createdAt: r.created_at,
      deletedAt: r.deleted_at ?? null,
    };
  }

  private mapPricingRule(r: any): PricingRuleRecord {
    return {
      id: r.id,
      serviceId: r.service_id,
      petSpecies: r.pet_species,
      minWeight: r.min_weight ? Number(r.min_weight) : null,
      maxWeight: r.max_weight ? Number(r.max_weight) : null,
      price: Number(r.price),
      durationMinutes: r.duration_minutes,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      deletedAt: r.deleted_at ?? null,
    };
  }

  private mapChecklistTemplate(r: any): ChecklistTemplateRecord {
    return {
      id: r.id,
      serviceId: r.service_id,
      title: r.title,
      description: r.description,
      isRequired: r.is_required ?? true,
      sortOrder: r.sort_order ?? 0,
      createdAt: r.created_at,
      deletedAt: r.deleted_at ?? null,
    };
  }

  private mapCancellationPolicy(r: any): CancellationPolicyRecord {
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      rulesJson: r.rules_json,
      isActive: r.is_active,
      createdAt: r.created_at,
    };
  }
}
