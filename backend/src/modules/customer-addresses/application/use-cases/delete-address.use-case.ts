import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CUSTOMER_ADDRESSES_REPOSITORY } from '../../customer-addresses.tokens';
import type { ICustomerAddressesRepository } from '../ports/customer-addresses.repository.port';

@Injectable()
export class DeleteAddressUseCase {
  constructor(
    @Inject(CUSTOMER_ADDRESSES_REPOSITORY)
    private readonly addressesRepository: ICustomerAddressesRepository,
  ) {}

  async execute(id: string, customerId: string): Promise<void> {
    const address = await this.addressesRepository.findById(id);
    if (!address || address.customerId !== customerId) {
      throw new NotFoundException(
        'Không tìm thấy địa chỉ yêu cầu hoặc địa chỉ không thuộc về bạn.',
      );
    }
    await this.addressesRepository.deleteSoft(id, customerId);
  }
}
