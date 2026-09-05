import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { booking_status, dispute_decision } from '@prisma/client';

export interface ResolveDisputeInput {
  adminId: string;
  complaintId: string;
  customerRefundPercentage: number;
  resolutionNote: string;
}

@Injectable()
export class AdminResolveDisputeUseCase {
  private readonly logger = new Logger(AdminResolveDisputeUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settlementsService: SettlementsService,
  ) {}

  async execute(input: ResolveDisputeInput) {
    const { adminId, complaintId, customerRefundPercentage, resolutionNote } = input;

    if (customerRefundPercentage < 0 || customerRefundPercentage > 100) {
      throw new BadRequestException('Tỷ lệ hoàn tiền phải từ 0 đến 100');
    }

    if (!resolutionNote || resolutionNote.trim() === '') {
      throw new BadRequestException('Bắt buộc phải nhập lý do phân xử');
    }

    const complaint = await this.prisma.complaints.findUnique({
      where: { id: complaintId },
      include: { bookings: { include: { payments: true } } },
    });

    if (!complaint) {
      throw new NotFoundException('Dispute not found');
    }

    if (complaint.status === 'RESOLVED') {
      throw new ConflictException('Dispute is already resolved');
    }

    const booking = complaint.bookings;
    if (!booking) {
      throw new BadRequestException('Dispute does not have an associated booking');
    }

    return this.prisma.$transaction(async (tx) => {
      let decision: dispute_decision = dispute_decision.PARTIAL_REFUND;
      if (customerRefundPercentage === 100) {
        decision = dispute_decision.FULL_REFUND;
      } else if (customerRefundPercentage === 0) {
        decision = dispute_decision.RELEASE_TO_PROVIDER;
      }

      // 1. Cập nhật khiếu nại (Complaint)
      const updatedComplaint = await tx.complaints.update({
        where: { id: complaintId },
        data: {
          status: 'RESOLVED',
          admin_id: adminId,
          decision: decision,
          resolution_note: resolutionNote,
          resolved_at: new Date(),
        },
      });

      // 2. Thực hiện nghiệp vụ hoàn tiền và giải phóng quỹ thông qua SettlementsService
      await this.settlementsService.resolveDisputeSettlement(
        booking.id,
        customerRefundPercentage,
        tx,
        `Phân xử tranh chấp: ${resolutionNote}`,
      );

      // 3. Đổi trạng thái Booking sang RESOLVED (Đã bổ sung trong Schema)
      await tx.bookings.update({
        where: { id: booking.id },
        data: { status: booking_status.RESOLVED },
      });

      await tx.booking_status_logs.create({
        data: {
          booking_id: booking.id,
          new_status: booking_status.RESOLVED,
          changed_by: adminId,
          note: `Tranh chấp đã được Admin giải quyết: ${resolutionNote}`,
        },
      });

      // 4. Phạt Trust Score đối với Provider nếu tỷ lệ lỗi phần lớn thuộc về họ
      // Tỷ lệ hoàn khách > 50% đồng nghĩa Provider có lỗi lớn
      if (customerRefundPercentage > 50 && booking.provider_id) {
        await tx.provider_profiles.update({
          where: { user_id: booking.provider_id },
          data: {
            trust_score: {
              decrement: 10, // Trừ 10 điểm uy tín cho mỗi vi phạm nghiêm trọng
            },
          },
        });
      }

      // 5. Ghi Log Audit
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'RESOLVE_DISPUTE',
          target_type: 'COMPLAINT',
          target_id: complaintId,
          old_value: { status: 'OPEN' },
          new_value: { status: 'RESOLVED', refundPercentage: customerRefundPercentage, note: resolutionNote },
          reason: resolutionNote,
        },
      });

      this.logger.log(`Admin ${adminId} resolved dispute ${complaintId} for booking ${booking.id} with refund ${customerRefundPercentage}%`);

      return {
        success: true,
        complaint: updatedComplaint,
      };
    });
  }
}
