import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SERVICES_REPOSITORY } from '../../services.tokens';
import type { IServicesRepository } from '../ports/services.repository.port';
import { CancellationPolicyRecord, CreateCancellationPolicyInput } from '../types/services.types';

@Injectable()
export class ManageCancellationPolicyUseCase {
  constructor(
    @Inject(SERVICES_REPOSITORY)
    private readonly servicesRepository: IServicesRepository,
  ) {}

  async create(input: CreateCancellationPolicyInput): Promise<CancellationPolicyRecord> {
    return this.servicesRepository.createCancellationPolicy(input);
  }

  async getDetail(id: string): Promise<CancellationPolicyRecord> {
    const policy = await this.servicesRepository.findCancellationPolicyById(id);
    if (!policy) {
      throw new NotFoundException('Không tìm thấy chính sách hủy yêu cầu.');
    }
    return policy;
  }

  async getList(): Promise<CancellationPolicyRecord[]> {
    return this.servicesRepository.findAllCancellationPolicies();
  }
}
