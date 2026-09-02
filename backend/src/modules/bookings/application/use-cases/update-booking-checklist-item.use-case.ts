/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { UpdateSingleChecklistItemDto } from '../../presentation/dto/update-checklist-item.dto';

@Injectable()
export class UpdateBookingChecklistItemUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
  ) {}

  async execute(
    providerUserId: string,
    bookingId: string,
    itemId: string,
    dto: UpdateSingleChecklistItemDto,
  ) {
    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt lịch với ID: ${bookingId}`);
    }

    const assignedProviderUserId =
      booking.provider_working_slots?.provider_working_days?.provider_profiles?.user_id;

    if (assignedProviderUserId !== providerUserId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa checklist của đơn này.');
    }

    const item = await this.bookingRepo.findChecklistItemById(itemId);
    if (!item) {
      throw new NotFoundException(`Không tìm thấy mục checklist với ID: ${itemId}`);
    }

    const completedAt = dto.status === 'DONE' ? new Date() : null;

    return this.unitOfWork.transaction(async (tx) => {
      const updatedItem = await this.bookingRepo.updateChecklistItem(
        itemId,
        {
          status: dto.status,
          note: dto.note,
          completed_at: completedAt,
        },
        tx,
      );

      // Add event log
      await this.bookingRepo.addBookingEvent(
        bookingId,
        providerUserId,
        'CHECKLIST_ITEM_COMPLETED',
        `Checklist item "${item.title}" updated to status ${dto.status}`,
        tx,
      );

      return {
        id: updatedItem.id,
        title: updatedItem.title,
        status: updatedItem.status,
        note: updatedItem.note,
        completedAt: updatedItem.completed_at,
      };
    });
  }
}
