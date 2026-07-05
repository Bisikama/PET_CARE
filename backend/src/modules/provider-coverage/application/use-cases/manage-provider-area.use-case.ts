import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { PROVIDER_COVERAGE_REPOSITORY } from '../../provider-coverage.tokens';
import type { IProviderCoverageRepository } from '../ports/provider-coverage.repository.port';
import {
  ProviderServiceAreaRecord,
  CreateProviderAreaInput,
  UpdateProviderAreaInput,
} from '../types/provider-coverage.types';

@Injectable()
export class ManageProviderAreaUseCase {
  constructor(
    @Inject(PROVIDER_COVERAGE_REPOSITORY)
    private readonly coverageRepository: IProviderCoverageRepository,
  ) {}

  async create(userId: string, input: CreateProviderAreaInput): Promise<ProviderServiceAreaRecord> {
    const provider = await this.coverageRepository.findProviderProfileByUserId(userId);
    if (!provider) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác của bạn.');
    }

    const isDuplicate = await this.coverageRepository.checkDuplicate(
      provider.id,
      input.city,
      input.district,
      input.ward,
    );

    if (isDuplicate) {
      throw new ConflictException('Khu vực này đã được đăng ký trước đó.');
    }

    return this.coverageRepository.createArea(provider.id, input);
  }

  async update(
    id: string,
    userId: string,
    input: UpdateProviderAreaInput,
  ): Promise<ProviderServiceAreaRecord> {
    const provider = await this.coverageRepository.findProviderProfileByUserId(userId);
    if (!provider) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác của bạn.');
    }

    const area = await this.coverageRepository.findAreaById(id);
    if (!area || area.providerId !== provider.id) {
      throw new NotFoundException(
        'Không tìm thấy khu vực hoạt động hoặc khu vực không thuộc quản lý của bạn.',
      );
    }

    if (input.city || input.district || input.ward) {
      const city = input.city ?? area.city;
      const district = input.district ?? area.district;
      const ward = input.ward ?? area.ward;

      const isDuplicate = await this.coverageRepository.checkDuplicate(
        provider.id,
        city,
        district,
        ward,
      );
      if (isDuplicate) {
        throw new ConflictException('Khu vực này đã được đăng ký trước đó.');
      }
    }

    return this.coverageRepository.updateArea(id, provider.id, input);
  }

  async delete(id: string, userId: string): Promise<void> {
    const provider = await this.coverageRepository.findProviderProfileByUserId(userId);
    if (!provider) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác của bạn.');
    }

    const area = await this.coverageRepository.findAreaById(id);
    if (!area || area.providerId !== provider.id) {
      throw new NotFoundException(
        'Không tìm thấy khu vực hoạt động hoặc khu vực không thuộc quản lý của bạn.',
      );
    }

    await this.coverageRepository.deleteAreaSoft(id, provider.id);
  }

  async getList(userId: string): Promise<ProviderServiceAreaRecord[]> {
    const provider = await this.coverageRepository.findProviderProfileByUserId(userId);
    if (!provider) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác của bạn.');
    }

    return this.coverageRepository.findAreasByProviderId(provider.id);
  }
}
