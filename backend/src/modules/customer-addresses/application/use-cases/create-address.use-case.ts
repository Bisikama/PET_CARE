import { Injectable, Inject } from '@nestjs/common';
import { CUSTOMER_ADDRESSES_REPOSITORY } from '../../customer-addresses.tokens';
import type { ICustomerAddressesRepository } from '../ports/customer-addresses.repository.port';
import { CreateAddressInput, CustomerAddressRecord } from '../types/customer-addresses.types';

@Injectable()
export class CreateAddressUseCase {
  constructor(
    @Inject(CUSTOMER_ADDRESSES_REPOSITORY)
    private readonly addressesRepository: ICustomerAddressesRepository,
  ) {}

  async execute(customerId: string, input: CreateAddressInput): Promise<CustomerAddressRecord> {
    const address = await this.addressesRepository.create(customerId, input);

    if (input.isDefault) {
      await this.addressesRepository.unsetOtherDefaults(customerId, address.id);
    }

    return address;
  }
}
