import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class BlockProviderSlotUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, slotId: string) {
    const slot = await this.prisma.provider_working_slots.findUnique({
      where: { id: slotId },
      include: {
        provider_working_days: {
          include: {
            provider_profiles: true
          }
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('Không tìm thấy slot lịch làm việc');
    }

    if (slot.provider_working_days?.provider_profiles?.user_id !== userId) {
      throw new BadRequestException('Bạn không có quyền thao tác trên slot này');
    }

    if (slot.status === 'BOOKED' || slot.status === 'HELD_FOR_PAYMENT') {
      throw new BadRequestException('Không thể tạm khóa slot đã được đặt (Bạn cần hủy Booking trước)');
    }

    if (slot.status === 'BLOCKED') {
      return { success: true, message: 'Slot đã bị khóa từ trước' };
    }

    const updatedSlot = await this.prisma.provider_working_slots.update({
      where: { id: slotId },
      data: { status: 'BLOCKED' },
    });

    return {
      success: true,
      message: 'Đã tạm khóa slot thành công',
      data: updatedSlot,
    };
  }
}
