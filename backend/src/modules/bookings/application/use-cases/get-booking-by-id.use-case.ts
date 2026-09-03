/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';

/**
 * Use Case: Lấy chi tiết một đơn đặt lịch theo ID.
 * - Kiểm tra booking có tồn tại không.
 * - Kiểm tra quyền: chỉ Customer hoặc Provider của booking mới được xem.
 */
@Injectable()
export class GetBookingByIdUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
  ) {}

  async execute(userId: string, bookingId: string) {
    const booking = await this.bookingRepo.findBookingById(bookingId);

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt lịch với ID: ${bookingId}`);
    }

    // Authorization: Chỉ customer hoặc provider của booking mới được truy cập
    if (booking.customer_id !== userId && booking.provider_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xem đơn đặt lịch này');
    }

    return booking;
  }
}
