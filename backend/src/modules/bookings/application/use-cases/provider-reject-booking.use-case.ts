/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';

@Injectable()
export class ProviderRejectBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly stateMachine: BookingStateMachineService,
  ) {}

  async execute(providerUserId: string, bookingId: string) {
    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Load provider profile to verify user owns the booking
    const slot = await this.bookingRepo.findProviderWorkingSlotById(
      booking.provider_working_slot_id,
    );
    if (!slot) {
      throw new NotFoundException('Working slot associated with this booking not found');
    }

    const providerProfile = slot.provider_working_days.provider_profiles;
    if (providerProfile.user_id !== providerUserId) {
      throw new ForbiddenException('Bạn không phải là đối tác được chỉ định cho yêu cầu này.');
    }

    // Determine next state
    const nextStatus = this.stateMachine.providerReject(booking.status);

    return this.unitOfWork.transaction(async (tx) => {
      // 1. Update Booking status to REJECTED
      await this.bookingRepo.updateBookingStatus(bookingId, nextStatus, tx);

      // 2. Update Slot status to AVAILABLE
      await this.bookingRepo.updateWorkingSlotStatus(
        booking.provider_working_slot_id,
        'AVAILABLE',
        null,
        tx,
      );

      // 3. Log event
      await this.bookingRepo.addBookingEvent(
        bookingId,
        providerProfile.user_id,
        'PROVIDER_REJECTED',
        'Booking request rejected by provider',
        tx,
      );

      return { bookingId, status: nextStatus };
    });
  }
}
