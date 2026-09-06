import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';
import { StartServiceDto } from '../../presentation/dto/start-service.dto';

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

  async execute(providerUserId: string, bookingId: string, dto?: StartServiceDto) {
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
      // 1. Upload check-in / start evidence media if provided
      if (dto?.evidenceMedias && dto.evidenceMedias.length > 0) {
        await this.bookingRepo.createBookingMedia(
          dto.evidenceMedias.map((media) => ({
            booking_id: bookingId,
            uploaded_by: providerUserId,
            media_url: media.mediaUrl,
            media_type: media.mediaType || 'IMAGE',
            caption: media.caption || 'Ảnh chụp hiện trạng ban đầu khi tiếp nhận thú cưng',
          })),
          tx,
        );

        await this.bookingRepo.addBookingEvent(
          bookingId,
          providerUserId,
          'EVIDENCE_UPLOADED',
          `Provider uploaded ${dto.evidenceMedias.length} check-in photo(s)`,
          tx,
        );
      }

      // 2. Update Booking status to IN_PROGRESS
      await this.bookingRepo.updateBookingStatus(bookingId, nextStatus, tx);

      // 3. Add status log
      const logNote = dto?.petConditionNote
        ? `Bắt đầu dịch vụ. Hiện trạng thú cưng: ${dto.petConditionNote}`
        : 'Đối tác đã có mặt và bắt đầu thực hiện dịch vụ.';

      await this.bookingRepo.addBookingStatusLog(
        bookingId,
        booking.status,
        nextStatus,
        providerUserId,
        logNote,
        tx,
      );

      // 4. Add booking event
      await this.bookingRepo.addBookingEvent(
        bookingId,
        providerUserId,
        'SERVICE_STARTED',
        dto?.petConditionNote || 'Service is now in progress',
        tx,
      );

      return {
        bookingId,
        status: nextStatus,
        message: 'Dịch vụ đã bắt đầu thực hiện và lưu hiện trạng thú cưng thành công.',
      };
    });

    // 5. Gửi thông báo Real-time cho Customer
    await this.notificationsService.sendNotification({
      userId: booking.customer_id,
      type: 'SERVICE_STARTED',
      title: 'Dịch vụ đã bắt đầu thực hiện',
      content: dto?.petConditionNote
        ? `Đối tác đã tiếp nhận bé và bắt đầu làm dịch vụ. Ghi chú: ${dto.petConditionNote}`
        : 'Đối tác đã có mặt và bắt đầu thực hiện dịch vụ chăm sóc thú cưng.',
      bookingId,
      actionUrl: `/customer/bookings/${bookingId}`,
      metadata: { bookingId, status: nextStatus },
    }).catch(() => {});

    return result;
  }
}
