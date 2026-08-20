import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { OpenDisputeDto, ResolveDisputeDto } from '../../dto/dispute.dto';
import { booking_status, payment_status, complaint_status } from '@prisma/client';
import { randomUUID } from 'crypto';

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: SupabaseStorageService,
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

      await tx.payments.update({
        where: { booking_id: bookingId },
        data: { status: payment_status.PAID_HELD_IN_ESCROW },
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
      let newBookingStatus: booking_status = booking_status.COMPLETED;
      let newPaymentStatus: payment_status = payment_status.RELEASED_TO_PROVIDER;

      if (dto.decision === 'FULL_REFUND' || dto.decision === 'PARTIAL_REFUND') {
        newBookingStatus = booking_status.CANCELLED;
        newPaymentStatus = payment_status.REFUNDED;
      }

      await tx.bookings.update({
        where: { id: bookingId },
        data: { status: newBookingStatus },
      });

      await tx.payments.update({
        where: { booking_id: bookingId },
        data: { status: newPaymentStatus, refunded_at: newPaymentStatus === payment_status.REFUNDED ? new Date() : null, released_at: newPaymentStatus === payment_status.RELEASED_TO_PROVIDER ? new Date() : null },
      });

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
}
