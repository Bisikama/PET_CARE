/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { BookingRepositoryPort } from '../../application/ports/booking-repository.port';
import { booking_status, availability_slot_status, booking_event_type } from '@prisma/client';

@Injectable()
export class PrismaBookingRepository implements BookingRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findPetById(petId: string): Promise<any> {
    return this.prisma.pets.findUnique({
      where: { id: petId },
    });
  }

  async findAddressById(addressId: string): Promise<any> {
    return this.prisma.customer_addresses.findUnique({
      where: { id: addressId },
    });
  }

  async findProviderWorkingSlotById(slotId: string, tx?: any): Promise<any> {
    const client = tx || this.prisma;
    return await client.provider_working_slots.findUnique({
      where: { id: slotId },
      include: {
        provider_working_days: {
          include: {
            provider_profiles: true,
          },
        },
        time_slots: true,
      },
    });
  }

  async updateWorkingSlotStatus(
    slotId: string,
    status: availability_slot_status,
    reservedUntil?: Date | null,
    tx?: any,
  ): Promise<number> {
    const client = tx || this.prisma;

    // Concurrency Lock: only allow booking/reservation if current status is AVAILABLE
    const whereCondition: any = { id: slotId };
    if (status === 'RESERVED_FOR_PROVIDER_RESPONSE') {
      whereCondition.status = 'AVAILABLE';
    }

    const result = await client.provider_working_slots.updateMany({
      where: whereCondition,
      data: {
        status,
        reserved_until: reservedUntil,
        updated_at: new Date(),
      },
    });
    return result.count;
  }

  async findProviderService(
    providerId: string,
    serviceId: string,
    petSpecies: string,
    petWeight: number,
  ): Promise<any> {
    return this.prisma.provider_services.findFirst({
      where: {
        provider_id: providerId,
        service_id: serviceId,
        pet_species: petSpecies,
        min_weight: { lte: petWeight },
        max_weight: { gte: petWeight },
        status: 'APPROVED',
        is_active: true,
      },
      include: {
        services: true,
      },
    });
  }

  async createBooking(
    bookingData: {
      customerId: string;
      providerId: string;
      addressId: string;
      providerWorkingSlotId: string;
      requestedSlotId: string;
      requestedDate: Date;
      serviceDurationMinutes: number;
      estimatedStartAt: Date;
      estimatedEndAt: Date;
      status: booking_status;
      totalPrice: number;
      customerNote?: string;
      addressSnapshot?: any;
      priceSnapshot?: any;
    },
    bookingPetData: {
      petId: string;
      petName: string;
      species: string;
      breed?: string;
      age?: number;
      weight?: number;
      gender?: string;
      healthNote?: string;
      behaviorNote?: string;
      avatarUrl?: string;
    },
    bookingServiceData: {
      providerServiceId: string;
      price: number;
      durationMinutes: number;
      serviceName: string;
      serviceDescription?: string;
      serviceCategory?: string;
    },
    tx?: any,
  ): Promise<any> {
    const client = tx || this.prisma;

    // 1. Create booking
    const booking = await client.bookings.create({
      data: {
        customer_id: bookingData.customerId,
        provider_id: bookingData.providerId,
        address_id: bookingData.addressId,
        provider_working_slot_id: bookingData.providerWorkingSlotId,
        requested_slot_id: bookingData.requestedSlotId,
        requested_date: bookingData.requestedDate,
        service_duration_minutes: bookingData.serviceDurationMinutes,
        estimated_start_at: bookingData.estimatedStartAt,
        estimated_end_at: bookingData.estimatedEndAt,
        status: bookingData.status,
        total_price: bookingData.totalPrice,
        customer_note: bookingData.customerNote,
        address_snapshot: bookingData.addressSnapshot,
        price_snapshot: bookingData.priceSnapshot,
      },
    });

    // 2. Create booking_pets
    const bookingPet = await client.booking_pets.create({
      data: {
        booking_id: booking.id,
        pet_id: bookingPetData.petId,
        pet_name: bookingPetData.petName,
        species: bookingPetData.species,
        breed: bookingPetData.breed,
        age: bookingPetData.age,
        weight: bookingPetData.weight,
        gender: bookingPetData.gender,
        health_note: bookingPetData.healthNote,
        behavior_note: bookingPetData.behaviorNote,
        avatar_url: bookingPetData.avatarUrl,
      },
    });

    // 3. Create booking_services
    await client.booking_services.create({
      data: {
        booking_pet_id: bookingPet.id,
        provider_service_id: bookingServiceData.providerServiceId,
        price: bookingServiceData.price,
        duration_minutes: bookingServiceData.durationMinutes,
        service_name: bookingServiceData.serviceName,
        service_description: bookingServiceData.serviceDescription,
        service_category: bookingServiceData.serviceCategory,
      },
    });

    // 4. Create booking status log
    await client.booking_status_logs.create({
      data: {
        booking_id: booking.id,
        new_status: bookingData.status,
        changed_by: bookingData.customerId,
        note: 'Booking request created',
      },
    });

    return booking;
  }

  async findBookingById(bookingId: string, tx?: any): Promise<any> {
    const client = tx || this.prisma;
    return await client.bookings.findUnique({
      where: { id: bookingId },
      include: {
        booking_pets: {
          include: {
            booking_services: true,
          },
        },
      },
    });
  }

  async updateBookingStatus(bookingId: string, status: booking_status, tx?: any): Promise<any> {
    const client = tx || this.prisma;
    return await client.bookings.update({
      where: { id: bookingId },
      data: {
        status,
        updated_at: new Date(),
      },
    });
  }

  async addBookingEvent(
    bookingId: string,
    actorId: string | null,
    eventType: booking_event_type,
    note?: string,
    tx?: any,
  ): Promise<any> {
    const client = tx || this.prisma;
    return await client.booking_events.create({
      data: {
        booking_id: bookingId,
        actor_id: actorId,
        event_type: eventType,
        note: note,
      },
    });
  }

  async searchMatchingProviders(
    serviceId: string,
    petSpecies: string,
    petWeight: number,
    city: string,
    district: string,
    ward: string,
    date: Date,
  ): Promise<any[]> {
    // Look up providers that are approved and active
    // that have active and approved capability matching the service, pet species, and weight range
    // and have a service area covering the customer address
    // and have at least one AVAILABLE working slot on that date.
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const providers = await this.prisma.provider_profiles.findMany({
      where: {
        status: 'APPROVED',
        kyc_status: 'APPROVED',
        users: {
          isActive: true,
        },
        provider_services: {
          some: {
            service_id: serviceId,
            pet_species: petSpecies,
            min_weight: { lte: petWeight },
            max_weight: { gte: petWeight },
            status: 'APPROVED',
            is_active: true,
          },
        },
        provider_service_areas: {
          some: {
            city: city,
            district: district,
            ward: ward,
            is_active: true,
          },
        },
        provider_working_days: {
          some: {
            work_date: {
              gte: startOfDay,
              lte: endOfDay,
            },
            provider_working_slots: {
              some: {
                status: 'AVAILABLE',
              },
            },
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        provider_services: {
          where: {
            service_id: serviceId,
            pet_species: petSpecies,
            min_weight: { lte: petWeight },
            max_weight: { gte: petWeight },
            status: 'APPROVED',
            is_active: true,
          },
        },
        provider_working_days: {
          where: {
            work_date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            provider_working_slots: {
              where: {
                status: 'AVAILABLE',
              },
              include: {
                time_slots: true,
              },
            },
          },
        },
      },
    });

    return providers;
  }
}
