/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */

import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { CreateBookingDto } from '../../presentation/dto/create-booking.dto';

@Injectable()
export class CreateBookingRequestUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
  ) {}

  async execute(customerId: string, dto: CreateBookingDto) {
    // 1. Verify Pet and ownership
    const pet = await this.bookingRepo.findPetById(dto.petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${dto.petId} not found`);
    }
    if (pet.customer_id !== customerId) {
      throw new BadRequestException('Thú cưng này không thuộc về tài khoản của bạn.');
    }

    // 2. Verify Address and ownership
    const address = await this.bookingRepo.findAddressById(dto.addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${dto.addressId} not found`);
    }
    if (address.customer_id !== customerId) {
      throw new BadRequestException('Địa chỉ này không thuộc về tài khoản của bạn.');
    }

    // 3. Verify Working Slot
    const slot = await this.bookingRepo.findProviderWorkingSlotById(dto.providerWorkingSlotId);
    if (!slot) {
      throw new NotFoundException(`Working slot with ID ${dto.providerWorkingSlotId} not found`);
    }
    const providerId = slot.provider_working_days.provider_id;
    const workDate = slot.provider_working_days.work_date;

    // 4. Verify Provider Capability and Service
    const providerService = await this.bookingRepo.findProviderService(
      providerId,
      dto.serviceId,
      pet.species,
      Number(pet.weight),
    );
    if (!providerService) {
      throw new BadRequestException(
        'Đối tác không cung cấp dịch vụ này hoặc không hỗ trợ loài/cân nặng của thú cưng.',
      );
    }

    // Calculate dates & times
    const dateStr = workDate.toISOString().split('T')[0];
    const estimatedStartAt = new Date(`${dateStr}T${slot.time_slots.start_time}:00`);
    const estimatedEndAt = new Date(`${dateStr}T${slot.time_slots.end_time}:00`);

    // 5. Execute transaction with concurrency check
    return this.unitOfWork.transaction(async (tx) => {
      // Concurrency update: check if slot is AVAILABLE and update status to RESERVED
      // This is the core lock mechanism to prevent double booking.
      const reservedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes reservation
      const affectedRows = await this.bookingRepo.updateWorkingSlotStatus(
        dto.providerWorkingSlotId,
        'RESERVED_FOR_PROVIDER_RESPONSE',
        reservedUntil,
        tx,
      );

      if (affectedRows === 0) {
        throw new ConflictException(
          'Slot này vừa được người khác đặt trước. Vui lòng chọn ca làm việc khác.',
        );
      }

      // Build snapshots
      const addressSnapshot = {
        receiverName: address.receiver_name,
        phone: address.phone,
        addressLine: address.address_line,
        ward: address.ward,
        district: address.district,
        city: address.city,
      };

      const priceSnapshot = {
        basePrice: Number(providerService.services.basePrice),
        finalPrice: Number(providerService.price),
      };

      // Create booking and related tables
      const booking = await this.bookingRepo.createBooking(
        {
          customerId,
          providerId,
          addressId: dto.addressId,
          providerWorkingSlotId: dto.providerWorkingSlotId,
          requestedSlotId: slot.slot_id,
          requestedDate: workDate,
          serviceDurationMinutes: providerService.services.duration_minutes,
          estimatedStartAt,
          estimatedEndAt,
          status: 'PENDING_PROVIDER_ACCEPTANCE',
          totalPrice: Number(providerService.price),
          customerNote: dto.customerNote,
          addressSnapshot,
          priceSnapshot,
        },
        {
          petId: pet.id,
          petName: pet.name,
          species: pet.species,
          breed: pet.breed || undefined,
          age: pet.age || undefined,
          weight: Number(pet.weight) || undefined,
          gender: pet.gender || undefined,
          healthNote: pet.health_note || undefined,
          behaviorNote: pet.behavior_note || undefined,
          avatarUrl: pet.avatar_url || undefined,
        },
        {
          providerServiceId: providerService.id,
          price: Number(providerService.price),
          durationMinutes: providerService.services.duration_minutes,
          serviceName: providerService.services.name,
          serviceDescription: providerService.services.description || undefined,
          serviceCategory: providerService.services.category || undefined,
        },
        tx,
      );

      // Log event
      await this.bookingRepo.addBookingEvent(
        booking.id,
        customerId,
        'BOOKING_CREATED',
        'Booking request submitted by customer',
        tx,
      );

      return booking;
    });
  }
}
