import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CUSTOMER_ADDRESSES_REPOSITORY } from '../../customer-addresses.tokens';
import type { ICustomerAddressesRepository } from '../ports/customer-addresses.repository.port';
import { CustomerAddressRecord } from '../types/customer-addresses.types';

@Injectable()
export class GetAddressesUseCase {
  constructor(
    @Inject(CUSTOMER_ADDRESSES_REPOSITORY)
    private readonly addressesRepository: ICustomerAddressesRepository,
  ) {}

  async executeList(customerId: string): Promise<CustomerAddressRecord[]> {
    return this.addressesRepository.findByCustomerId(customerId);
  }

  async executeDetail(id: string, customerId: string): Promise<CustomerAddressRecord> {
    const address = await this.addressesRepository.findById(id);
    if (!address || address.customerId !== customerId) {
      throw new NotFoundException(
        'Không tìm thấy địa chỉ yêu cầu hoặc địa chỉ không thuộc về bạn.',
      );
    }
    return address;
  }
}
