/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';
import { CompleteBookingDto } from '../../presentation/dto/complete-booking.dto';
import { NotificationsService } from '../../../growth/notifications/notifications.service';

@Injectable()
export class CompleteBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly stateMachine: BookingStateMachineService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(providerUserId: string, bookingId: string, dto: CompleteBookingDto) {
    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt lịch với ID: ${bookingId}`);
    }

    const assignedProviderUserId =
      booking.provider_working_slots?.provider_working_days?.provider_profiles?.user_id;

    if (assignedProviderUserId !== providerUserId) {
      throw new ForbiddenException('Bạn không phải là đối tác được chỉ định cho đơn đặt lịch này.');
    }

    const nextStatus = this.stateMachine.completeBooking(booking.status);

    const result = await this.unitOfWork.transaction(async (tx) => {
      const now = new Date();

      // 1. Batch update checklist items if provided
      if (dto.checklistItems && dto.checklistItems.length > 0) {
        for (const item of dto.checklistItems) {
          await this.bookingRepo.updateChecklistItem(
            item.checklistItemId,
            {
              status: item.status,
              note: item.note,
              completed_at: item.status === 'DONE' ? now : null,
            },
            tx,
          );
        }
      }

      // 2. Upload evidence media if provided
      if (dto.evidenceMedias && dto.evidenceMedias.length > 0) {
        await this.bookingRepo.createBookingMedia(
          dto.evidenceMedias.map((media) => ({
            booking_id: bookingId,
            uploaded_by: providerUserId,
            media_url: media.mediaUrl,
            media_type: media.mediaType || 'IMAGE',
            caption: media.caption || 'Ảnh chụp hoàn tất dịch vụ',
          })),
          tx,
        );

        await this.bookingRepo.addBookingEvent(
          bookingId,
          providerUserId,
          'EVIDENCE_UPLOADED',
          `Provider uploaded ${dto.evidenceMedias.length} evidence photo(s)`,
          tx,
        );
      }

      // 3. Update Booking status to COMPLETED
      await this.bookingRepo.updateBookingStatus(bookingId, nextStatus, tx);

      // 4. Add Status Log
      await this.bookingRepo.addBookingStatusLog(
        bookingId,
        booking.status,
        nextStatus,
        providerUserId,
        dto.providerNote || 'Dịch vụ đã hoàn tất và được đối tác xác nhận.',
        tx,
      );

      // 5. Add Booking Event
      await this.bookingRepo.addBookingEvent(
        bookingId,
        providerUserId,
        'CUSTOMER_CONFIRMED',
        'Booking service completed by provider',
        tx,
      );

      return {
        success: true,
        bookingId,
        status: nextStatus,
        message: 'Hoàn thành dịch vụ và cập nhật checklist thành công.',
      };
    });

    // 6. Gửi thông báo Real-time cho Customer
    await this.notificationsService.sendNotification({
      userId: booking.customer_id,
      type: 'BOOKING_COMPLETED',
      title: 'Dịch vụ đã hoàn tất',
      content: 'Đối tác đã cập nhật xong checklist và ảnh nghiệm thu. Hãy để lại đánh giá trải nghiệm nhé!',
      bookingId,
      actionUrl: `/customer/bookings/${bookingId}`,
      metadata: { bookingId, status: nextStatus },
    }).catch(() => {});

    return result;
  }
}
