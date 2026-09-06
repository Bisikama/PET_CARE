import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { BatchUpdateChecklistDto } from '../../presentation/dto/batch-update-checklist.dto';

@Injectable()
export class BatchUpdateChecklistUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
  ) {}

  async execute(providerUserId: string, bookingId: string, dto: BatchUpdateChecklistDto) {
    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt lịch với ID: ${bookingId}`);
    }

    const assignedProviderUserId =
      booking.provider_working_slots?.provider_working_days?.provider_profiles?.user_id;

    if (assignedProviderUserId !== providerUserId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa checklist của đơn này.');
    }

    // Validate that all items exist and belong to this booking
    for (const itemDto of dto.items) {
      const item = await this.bookingRepo.findChecklistItemById(itemDto.itemId);
      if (!item || item.booking_id !== bookingId) {
        throw new NotFoundException(`Không tìm thấy mục checklist với ID: ${itemDto.itemId} trong đơn hàng này`);
      }
    }

    return this.unitOfWork.transaction(async (tx) => {
      const updatedItems: Array<{
        id: string;
        title: string;
        status: any;
        note?: string | null;
        completedAt?: Date | null;
      }> = [];

      for (const itemDto of dto.items) {
        const completedAt = itemDto.status === 'DONE' ? new Date() : null;
        const updatedItem = await this.bookingRepo.updateChecklistItem(
          itemDto.itemId,
          {
            status: itemDto.status,
            note: itemDto.note,
            completed_at: completedAt,
          },
          tx,
        );

        updatedItems.push({
          id: updatedItem.id,
          title: updatedItem.title,
          status: updatedItem.status,
          note: updatedItem.note,
          completedAt: updatedItem.completed_at,
        });
      }

      // Add audit event log
      await this.bookingRepo.addBookingEvent(
        bookingId,
        providerUserId,
        'CHECKLIST_ITEM_COMPLETED',
        `Provider updated ${dto.items.length} checklist item(s) in batch`,
        tx,
      );

      return {
        success: true,
        message: `Đã cập nhật thành công ${updatedItems.length} mục checklist.`,
        updatedCount: updatedItems.length,
        items: updatedItems,
      };
    });
  }
}
