/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */

import { Inject, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';

@Injectable()
export class GetBookingChecklistUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
  ) {}

  async execute(userId: string, bookingId: string) {
    const booking = await this.bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn đặt lịch với ID: ${bookingId}`);
    }

    const providerUserId =
      booking.provider_working_slots?.provider_working_days?.provider_profiles?.user_id;

    // Check permission: User must be either Customer or assigned Provider
    if (booking.customer_id !== userId && providerUserId !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập thông tin checklist của đơn này.');
    }

    // Aggregate all checklist items across booking_pets and booking_services
    const items: any[] = [];
    if (booking.booking_pets && Array.isArray(booking.booking_pets)) {
      for (const pet of booking.booking_pets) {
        if (pet.booking_services && Array.isArray(pet.booking_services)) {
          for (const srv of pet.booking_services) {
            if (srv.booking_checklist_items && Array.isArray(srv.booking_checklist_items)) {
              for (const it of srv.booking_checklist_items) {
                items.push({
                  id: it.id,
                  bookingServiceId: it.booking_service_id,
                  serviceName: srv.service_name,
                  petName: pet.pet_name,
                  templateId: it.template_id,
                  title: it.title,
                  status: it.status,
                  note: it.note,
                  completedAt: it.completed_at,
                  createdAt: it.created_at,
                });
              }
            }
          }
        }
      }
    }

    const totalItems = items.length;
    const completedItems = items.filter((i) => i.status === 'DONE').length;
    const skippedItems = items.filter((i) => i.status === 'SKIPPED').length;
    const pendingItems = items.filter((i) => i.status === 'PENDING').length;

    return {
      bookingId: booking.id,
      bookingStatus: booking.status,
      totalItems,
      completedItems,
      skippedItems,
      pendingItems,
      progressPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      checklistItems: items,
      evidenceMedias: booking.booking_media || [],
    };
  }
}
