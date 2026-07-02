import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { SERVICES_REPOSITORY } from '../../services.tokens';
import type { IServicesRepository } from '../ports/services.repository.port';
import { UpdateServiceInput, ServiceRecord } from '../types/services.types';

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: IServicesRepository,
  ) {}

  async execute(id: string, input: UpdateServiceInput): Promise<ServiceRecord> {
    const existingService = await this.servicesRepository.findServiceById(id);
    if (!existingService) {
      throw new NotFoundException('Không tìm thấy dịch vụ yêu cầu.');
    }

    if (input.name) {
      const services = await this.servicesRepository.findAllServices();
      const isDuplicate = services.some(
        (s) => s.id !== id && s.name.toLowerCase() === input.name!.toLowerCase(),
      );

      if (isDuplicate) {
        throw new ConflictException('Tên dịch vụ mới đã tồn tại hệ thống.');
      }
    }

    return this.servicesRepository.updateService(id, input);
  }
}
