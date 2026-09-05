/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import { BOOKING_REPOSITORY } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';

@Injectable()
export class UploadBookingEvidenceUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async execute(userId: string, bookingId: string, file: Express.Multer.File) {
    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt lịch với ID: ${bookingId}`);
    }

    const assignedProviderUserId =
      booking.provider_working_slots?.provider_working_days?.provider_profiles?.user_id;

    // Check if the user is the assigned provider or the customer of this booking
    if (assignedProviderUserId !== userId && booking.customer_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền tải ảnh minh chứng cho đơn đặt lịch này.');
    }

    const bucket = 'booking-media';
    const ext = path.extname(file.originalname) || '.jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filePath = `bookings/${bookingId}/evidence-${timestamp}-${randomStr}${ext}`;

    const mediaUrl = await this.storageService.uploadFile(file, bucket, filePath);

    return {
      success: true,
      mediaUrl,
      mediaType: 'IMAGE',
      fileName: file.originalname,
      message: 'Tải ảnh minh chứng lên thành công.',
    };
  }
}
