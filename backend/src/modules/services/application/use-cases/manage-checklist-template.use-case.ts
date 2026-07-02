import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SERVICES_REPOSITORY } from '../../services.tokens';
import type { IServicesRepository } from '../ports/services.repository.port';
import {
  ChecklistTemplateRecord,
  CreateChecklistTemplateInput,
  UpdateChecklistTemplateInput,
} from '../types/services.types';

@Injectable()
export class ManageChecklistTemplateUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: IServicesRepository,
  ) {}

  async create(input: CreateChecklistTemplateInput): Promise<ChecklistTemplateRecord> {
    const service = await this.servicesRepository.findServiceById(input.serviceId);
    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ tương ứng để gắn checklist template.');
    }
    return this.servicesRepository.createChecklistTemplate(input);
  }

  async update(id: string, input: UpdateChecklistTemplateInput): Promise<ChecklistTemplateRecord> {
    const template = await this.servicesRepository.findChecklistTemplateById(id);
    if (!template) {
      throw new NotFoundException('Không tìm thấy checklist template yêu cầu.');
    }
    return this.servicesRepository.updateChecklistTemplate(id, input);
  }

  async delete(id: string): Promise<void> {
    const template = await this.servicesRepository.findChecklistTemplateById(id);
    if (!template) {
      throw new NotFoundException('Không tìm thấy checklist template yêu cầu.');
    }
    await this.servicesRepository.deleteChecklistTemplateSoft(id);
  }

  async getByServiceId(serviceId: string): Promise<ChecklistTemplateRecord[]> {
    const service = await this.servicesRepository.findServiceById(serviceId);
    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ yêu cầu.');
    }
    return this.servicesRepository.findChecklistTemplatesByServiceId(serviceId);
  }
}
