import {
  CustomerAddressRecord,
  CreateAddressInput,
  UpdateAddressInput,
} from '../types/customer-addresses.types';

export interface ICustomerAddressesRepository {
  create(customerId: string, data: CreateAddressInput): Promise<CustomerAddressRecord>;
  update(id: string, customerId: string, data: UpdateAddressInput): Promise<CustomerAddressRecord>;
  deleteSoft(id: string, customerId: string): Promise<void>;
  findById(id: string): Promise<CustomerAddressRecord | null>;
  findByCustomerId(customerId: string): Promise<CustomerAddressRecord[]>;
  unsetOtherDefaults(customerId: string, exceptId: string): Promise<void>;
}
