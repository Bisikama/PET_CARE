import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CUSTOMER_ADDRESSES_REPOSITORY } from '../../customer-addresses.tokens';
import type { ICustomerAddressesRepository } from '../ports/customer-addresses.repository.port';
import { CustomerAddressRecord, UpdateAddressInput } from '../types/customer-addresses.types';

@Injectable()
export class UpdateAddressUseCase {
  constructor(
    @Inject(CUSTOMER_ADDRESSES_REPOSITORY)
    private readonly addressesRepository: ICustomerAddressesRepository,
  ) {}

  async execute(
    id: string,
    customerId: string,
    input: UpdateAddressInput,
  ): Promise<CustomerAddressRecord> {
    const existingAddress = await this.addressesRepository.findById(id);
    if (!existingAddress || existingAddress.customerId !== customerId) {
      throw new NotFoundException(
        'Không tìm thấy địa chỉ yêu cầu hoặc địa chỉ không thuộc về bạn.',
      );
    }

    const address = await this.addressesRepository.update(id, customerId, input);

    if (input.isDefault) {
      await this.addressesRepository.unsetOtherDefaults(customerId, id);
    }

    return address;
  }
}
