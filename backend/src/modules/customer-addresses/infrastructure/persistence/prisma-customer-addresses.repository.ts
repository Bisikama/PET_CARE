import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { ICustomerAddressesRepository } from '../../application/ports/customer-addresses.repository.port';
import {
  CustomerAddressRecord,
  CreateAddressInput,
  UpdateAddressInput,
} from '../../application/types/customer-addresses.types';

@Injectable()
export class PrismaCustomerAddressesRepository implements ICustomerAddressesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, data: CreateAddressInput): Promise<CustomerAddressRecord> {
    const record = await this.prisma.customer_addresses.create({
      data: {
        customer_id: customerId,
        label: data.label ?? null,
        receiver_name: data.receiverName ?? null,
        phone: data.phone ?? null,
        address_line: data.addressLine,
        ward: data.ward ?? null,
        district: data.district ?? null,
        city: data.city ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        is_default: data.isDefault ?? false,
      },
    });

    return this.mapAddress(record);
  }

  async update(
    id: string,
    customerId: string,
    data: UpdateAddressInput,
  ): Promise<CustomerAddressRecord> {
    const record = await this.prisma.customer_addresses.update({
      where: { id, customer_id: customerId },
      data: {
        label: data.label,
        receiver_name: data.receiverName,
        phone: data.phone,
        address_line: data.addressLine,
        ward: data.ward,
        district: data.district,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        is_default: data.isDefault,
      },
    });

    return this.mapAddress(record);
  }

  async deleteSoft(id: string, customerId: string): Promise<void> {
    await this.prisma.customer_addresses.update({
      where: { id, customer_id: customerId },
      data: { deleted_at: new Date() },
    });
  }

  async findById(id: string): Promise<CustomerAddressRecord | null> {
    const record = await this.prisma.customer_addresses.findFirst({
      where: { id, deleted_at: null },
    });
    if (!record) return null;
    return this.mapAddress(record);
  }

  async findByCustomerId(customerId: string): Promise<CustomerAddressRecord[]> {
    const records = await this.prisma.customer_addresses.findMany({
      where: { customer_id: customerId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
    return records.map((r) => this.mapAddress(r));
  }

  async unsetOtherDefaults(customerId: string, exceptId: string): Promise<void> {
    await this.prisma.customer_addresses.updateMany({
      where: {
        customer_id: customerId,
        id: { not: exceptId },
        is_default: true,
      },
      data: { is_default: false },
    });
  }

  private mapAddress(r: any): CustomerAddressRecord {
    return {
      id: r.id,
      customerId: r.customer_id,
      label: r.label,
      receiverName: r.receiver_name,
      phone: r.phone,
      addressLine: r.address_line,
      ward: r.ward,
      district: r.district,
      city: r.city,
      latitude: r.latitude ? Number(r.latitude) : null,
      longitude: r.longitude ? Number(r.longitude) : null,
      isDefault: r.is_default ?? false,
      createdAt: r.created_at,
      deletedAt: r.deleted_at ?? null,
    };
  }
}
