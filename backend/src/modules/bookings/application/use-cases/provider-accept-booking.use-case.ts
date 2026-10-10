/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';

@Injectable()
export class ProviderAcceptBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly stateMachine: BookingStateMachineService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(providerUserId: string, bookingId: string) {
    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // 1. Verify provider authorization defensively
    let slot: any = null;
    if (booking.provider_working_slot_id) {
      slot = await this.bookingRepo.findProviderWorkingSlotById(
        booking.provider_working_slot_id,
      );
      if (!slot) {
        throw new NotFoundException('Working slot associated with this booking not found');
      }
    }

    const slotProviderUserId =
      slot?.provider_working_days?.provider_profiles?.user_id;
    const bookingProviderUserId = booking.provider_profiles?.user_id;
    const isAssignedProvider =
      (bookingProviderUserId && bookingProviderUserId === providerUserId) ||
      (slotProviderUserId && slotProviderUserId === providerUserId) ||
      booking.provider_id === providerUserId;

    if (!isAssignedProvider) {
      throw new ForbiddenException('Bạn không phải là đối tác được chỉ định cho yêu cầu này.');
    }

    // 2. Determine next state via State Machine
    const nextStatus = this.stateMachine.providerAccept(booking.status);

    const result = await this.unitOfWork.transaction(async (tx) => {
      // 2.1 Update Booking status to ACCEPTED
      await this.bookingRepo.updateBookingStatus(bookingId, nextStatus, tx);

      // 2.2 Create Chat Room for Customer and Provider
      await this.bookingRepo.createChatRoom(bookingId, booking.customer_id, providerUserId, tx);

      // 2.3 Update Slot status to BOOKED if working slot is linked
      if (booking.provider_working_slot_id) {
        await this.bookingRepo.updateWorkingSlotStatus(
          booking.provider_working_slot_id,
          'BOOKED',
          null,
          tx,
        );
      }

      // 2.4 Log event and status log
      await this.bookingRepo.addBookingEvent(
        bookingId,
        providerUserId,
        'PROVIDER_ACCEPTED',
        'Booking request accepted by provider',
        tx,
      );

      return { bookingId, status: nextStatus };
    });

    // 4. Gửi thông báo Real-time cho Customer
    await this.notificationsService.sendNotification({
      userId: booking.customer_id,
      type: 'BOOKING_ACCEPTED',
      title: 'Đơn đặt lịch đã được chấp nhận',
      content: 'Đối tác đã đồng ý nhận đơn. Phòng chat đã được kích hoạt!',
      bookingId,
      actionUrl: `/customer/bookings/${bookingId}`,
      metadata: { bookingId, status: nextStatus },
    }).catch(() => {});

    return result;
  }
}
