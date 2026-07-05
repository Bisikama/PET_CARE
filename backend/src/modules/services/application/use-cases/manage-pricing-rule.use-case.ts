import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SERVICES_REPOSITORY } from '../../services.tokens';
import type { IServicesRepository } from '../ports/services.repository.port';
import {
  PricingRuleRecord,
  CreatePricingRuleInput,
  UpdatePricingRuleInput,
} from '../types/services.types';

@Injectable()
export class ManagePricingRuleUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: IServicesRepository,
  ) {}

  async create(input: CreatePricingRuleInput): Promise<PricingRuleRecord> {
    const service = await this.servicesRepository.findServiceById(input.serviceId);
    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ tương ứng để gắn pricing rule.');
    }
    return this.servicesRepository.createPricingRule(input);
  }

  async update(id: string, input: UpdatePricingRuleInput): Promise<PricingRuleRecord> {
    const rule = await this.servicesRepository.findPricingRuleById(id);
    if (!rule) {
      throw new NotFoundException('Không tìm thấy pricing rule yêu cầu.');
    }
    return this.servicesRepository.updatePricingRule(id, input);
  }

  async delete(id: string): Promise<void> {
    const rule = await this.servicesRepository.findPricingRuleById(id);
    if (!rule) {
      throw new NotFoundException('Không tìm thấy pricing rule yêu cầu.');
    }
    await this.servicesRepository.deletePricingRuleSoft(id);
  }

  async getByServiceId(serviceId: string): Promise<PricingRuleRecord[]> {
    const service = await this.servicesRepository.findServiceById(serviceId);
    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ yêu cầu.');
    }
    return this.servicesRepository.findPricingRulesByServiceId(serviceId);
  }
}
