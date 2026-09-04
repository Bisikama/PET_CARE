/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';

@Injectable()
export class CustomerConfirmBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly stateMachine: BookingStateMachineService,
    private readonly settlementsService: SettlementsService,
  ) {}

  async execute(customerId: string, bookingId: string) {
    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt lịch với ID: ${bookingId}`);
    }

    if (booking.customer_id !== customerId) {
      throw new ForbiddenException('Bạn không phải là khách hàng của đơn đặt lịch này.');
    }

    const nextStatus = this.stateMachine.customerConfirmBooking(booking.status);

    return this.unitOfWork.transaction(async (tx) => {
      // 1. Update Booking status to COMPLETED
      await this.bookingRepo.updateBookingStatus(bookingId, nextStatus, tx);

      // 2. Add Status Log
      await this.bookingRepo.addBookingStatusLog(
        bookingId,
        booking.status,
        nextStatus,
        customerId,
        'Khách hàng đã xác nhận dịch vụ hoàn thành.',
        tx,
      );

      // 3. Add Booking Event
      await this.bookingRepo.addBookingEvent(
        bookingId,
        customerId,
        'CUSTOMER_CONFIRMED',
        'Customer confirmed the booking service',
        tx,
      );

      // 4. Release Escrow for Provider
      await this.settlementsService.releaseEscrow(bookingId, tx);

      return {
        success: true,
        bookingId,
        status: nextStatus,
        message: 'Xác nhận dịch vụ hoàn tất và tiền đã được chuyển cho đối tác.',
      };
    });
  }
}
