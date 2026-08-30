import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { OpenDisputeDto, ResolveDisputeDto } from '../../dto/dispute.dto';
import { booking_status, payment_status, complaint_status } from '@prisma/client';
import { randomUUID } from 'crypto';

import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
    private readonly settlementsService: SettlementsService,
  ) {}

  async openDispute(userId: string, bookingId: string, dto: OpenDisputeDto, files?: Express.Multer.File[]) {
    const booking = await this.prisma.bookings.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.customer_id !== userId && booking.provider_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (booking.status === booking_status.COMPLETED || booking.status === booking_status.CANCELLED) {
      throw new BadRequestException('Cannot open a dispute on a completed or cancelled booking');
    }

    const accusedId = booking.customer_id === userId ? booking.provider_id : booking.customer_id;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Complaint
      const complaint = await tx.complaints.create({
        data: {
          booking_id: bookingId,
          complainant_id: userId,
          accused_id: accusedId,
          title: dto.title,
          description: dto.description,
          reason: dto.reason,
          status: complaint_status.OPEN,
        },
      });

      // 2. Upload and save Evidences if any
      if (files && files.length > 0) {
        for (const file of files) {
          const fileName = `${bookingId}/dispute-${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
          const fileUrl = await this.storageService.uploadFile(file, 'evidences', fileName);
          await tx.complaint_evidences.create({
            data: {
              complaint_id: complaint.id,
              file_url: fileUrl,
              uploaded_by: userId,
            },
          });
        }
      }

      // 3. ESCROW MECHANISM: Update Booking to DISPUTED and Payment to ON_HOLD
      await tx.bookings.update({
        where: { id: bookingId },
        data: { status: booking_status.DISPUTED },
      });

      await tx.chat_rooms.updateMany({
        where: { booking_id: bookingId },
        data: { is_active: false },
      });

      await tx.payments.update({
        where: { booking_id: bookingId },
        data: { status: payment_status.ESCROW_ON_HOLD },
      });

      await tx.booking_status_logs.create({
        data: {
          booking_id: bookingId,
          new_status: booking_status.DISPUTED,
          changed_by: userId,
          note: 'Dispute opened: ' + dto.reason,
        },
      });

      return complaint;
    });
  }

  async resolveDispute(adminId: string, complaintId: string, dto: ResolveDisputeDto) {
    const complaint = await this.prisma.complaints.findUnique({
      where: { id: complaintId },
      include: { bookings: { include: { payments: true } } },
    });

    if (!complaint) throw new NotFoundException('Dispute not found');
    if (complaint.status === complaint_status.RESOLVED) {
      throw new BadRequestException('Dispute is already resolved');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Update Complaint
      const updatedComplaint = await tx.complaints.update({
        where: { id: complaintId },
        data: {
          status: complaint_status.RESOLVED,
          admin_id: adminId,
          decision: dto.decision,
          resolution_note: dto.resolutionNote,
          resolved_at: new Date(),
        },
      });

      const bookingId = complaint.booking_id;

      // 2. Resolve ESCROW based on decision
      let newBookingStatus: booking_status;
      if (dto.decision === 'FULL_REFUND' || dto.decision === 'PARTIAL_REFUND') {
        await this.settlementsService.refund(bookingId, tx, `Giải quyết khiếu nại (Hoàn tiền): ${dto.resolutionNote}`);
        newBookingStatus = booking_status.CANCELLED;
      } else {
        await this.settlementsService.releaseEscrow(bookingId, tx);
        newBookingStatus = booking_status.COMPLETED;
      }

      await tx.booking_status_logs.create({
        data: {
          booking_id: bookingId,
          new_status: newBookingStatus,
          changed_by: adminId,
          note: 'Dispute resolved by Admin: ' + dto.decision,
        },
      });

      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'RESOLVE_DISPUTE',
          target_type: 'complaints',
          target_id: complaintId,
          new_value: { decision: dto.decision, note: dto.resolutionNote },
        },
      });

      return updatedComplaint;
    });
  }

  async getAllDisputesAdmin() {
    return this.prisma.complaints.findMany({
      include: {
        bookings: { select: { id: true, total_price: true, status: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }
}
