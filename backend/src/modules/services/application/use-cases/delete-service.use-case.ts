import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SERVICES_REPOSITORY } from '../../services.tokens';
import type { IServicesRepository } from '../ports/services.repository.port';

@Injectable()
export class DeleteServiceUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: IServicesRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const service = await this.servicesRepository.findServiceById(id);
    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ yêu cầu.');
    }

    await this.servicesRepository.deleteServiceSoft(id);
  }
}
