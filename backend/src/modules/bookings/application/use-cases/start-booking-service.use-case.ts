/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';

@Injectable()
export class StartBookingServiceUseCase {
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
      throw new NotFoundException(`Không tìm thấy đơn đặt lịch với ID: ${bookingId}`);
    }

    const assignedProviderUserId =
      booking.provider_working_slots?.provider_working_days?.provider_profiles?.user_id;

    if (assignedProviderUserId !== providerUserId) {
      throw new ForbiddenException('Bạn không phải là đối tác được chỉ định cho đơn đặt lịch này.');
    }

    const nextStatus = this.stateMachine.startService(booking.status);

    const result = await this.unitOfWork.transaction(async (tx) => {
      // 1. Update Booking status to IN_PROGRESS
      await this.bookingRepo.updateBookingStatus(bookingId, nextStatus, tx);

      // 2. Add status log
      await this.bookingRepo.addBookingStatusLog(
        bookingId,
        booking.status,
        nextStatus,
        providerUserId,
        'Provider started performing the service',
        tx,
      );

      // 3. Add booking event
      await this.bookingRepo.addBookingEvent(
        bookingId,
        providerUserId,
        'SERVICE_STARTED',
        'Service is now in progress',
        tx,
      );

      return {
        bookingId,
        status: nextStatus,
        message: 'Dịch vụ đã bắt đầu thực hiện.',
      };
    });

    // 4. Gửi thông báo Real-time cho Customer
    await this.notificationsService.sendNotification({
      userId: booking.customer_id,
      type: 'SERVICE_STARTED',
      title: 'Dịch vụ đã bắt đầu thực hiện',
      content: 'Đối tác đã có mặt và bắt đầu thực hiện dịch vụ chăm sóc thú cưng.',
      bookingId,
      actionUrl: `/customer/bookings/${bookingId}`,
      metadata: { bookingId, status: nextStatus },
    }).catch(() => {});

    return result;
  }
}
