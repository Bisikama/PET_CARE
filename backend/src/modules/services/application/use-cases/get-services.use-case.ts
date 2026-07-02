import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SERVICES_REPOSITORY } from '../../services.tokens';
import type { IServicesRepository } from '../ports/services.repository.port';
import { ServiceRecord } from '../types/services.types';

@Injectable()
export class GetServicesUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: IServicesRepository,
  ) {}

  async executeList(): Promise<ServiceRecord[]> {
    return this.servicesRepository.findAllServices();
  }

  async executeDetail(id: string): Promise<ServiceRecord> {
    const service = await this.servicesRepository.findServiceById(id);
    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ yêu cầu.');
    }
    return service;
  }
}
