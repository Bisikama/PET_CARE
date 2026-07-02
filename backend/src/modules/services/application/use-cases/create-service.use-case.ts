import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { SERVICES_REPOSITORY } from '../../services.tokens';
import type { IServicesRepository } from '../ports/services.repository.port';
import { CreateServiceInput, ServiceRecord } from '../types/services.types';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: IServicesRepository,
  ) {}

  async execute(input: CreateServiceInput): Promise<ServiceRecord> {
    // Kiểm tra xem dịch vụ có trùng tên hay không
    const services = await this.servicesRepository.findAllServices();
    const isDuplicate = services.some((s) => s.name.toLowerCase() === input.name.toLowerCase());

    if (isDuplicate) {
      throw new ConflictException('Dịch vụ với tên này đã tồn tại.');
    }

    return this.servicesRepository.createService(input);
  }
}
