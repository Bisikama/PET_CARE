import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';
import { FEE_CONFIG_KEYS, ServiceFeeSettings, loadFeeSettings } from '../../domain/service-fees';
import { UpdateServiceFeesDto } from '../../dto/update-service-fees.dto';

/** Phí di chuyển & phụ phí dịch vụ — admin chỉnh, khách xem trên trang Dịch vụ. */
@Injectable()
export class ManageServiceFeesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  getSettings(): Promise<ServiceFeeSettings> {
    return loadFeeSettings(this.prisma);
  }

  async updateSettings(adminId: string, dto: UpdateServiceFeesDto): Promise<ServiceFeeSettings> {
    const surcharges = dto.surcharges.map((s) => {
      const maxFee =
        s.maxFee === undefined || s.maxFee === null || s.maxFee === s.minFee ? null : s.maxFee;
      if (maxFee !== null && maxFee < s.minFee) {
        throw new BadRequestException(
          `Phụ phí "${s.label}": mức cao nhất phải lớn hơn mức thấp nhất`,
        );
      }
      return { label: s.label, minFee: s.minFee, maxFee };
    });

    const next: ServiceFeeSettings = {
      travel: { freeKm: dto.travel.freeKm, perKm: dto.travel.perKm },
      surcharges,
    };

    await this.prisma.$transaction(async (tx) => {
      const old = await loadFeeSettings(tx);
      const rows: { key: string; value: string; description: string }[] = [
        {
          key: FEE_CONFIG_KEYS.travelFreeKm,
          value: String(next.travel.freeKm),
          description: 'Số km di chuyển đầu tiên được miễn phí',
        },
        {
          key: FEE_CONFIG_KEYS.travelPerKm,
          value: String(next.travel.perKm),
          description: 'Phí di chuyển mỗi km vượt thêm (VND)',
        },
        {
          key: FEE_CONFIG_KEYS.surcharges,
          value: JSON.stringify(next.surcharges),
          description:
            'Phụ phí có thể phát sinh (hiển thị cho khách, thống nhất trước khi thực hiện)',
        },
      ];
      for (const row of rows) {
        await tx.system_configs.upsert({
          where: { key: row.key },
          update: { value: row.value, description: row.description },
          create: row,
        });
      }
      await tx.audit_logs.create({
        data: {
          actor_id: adminId,
          action: 'UPDATE_SERVICE_FEES',
          target_type: 'SYSTEM_CONFIG',
          target_id: 'SERVICE_FEES',
          old_value: old as unknown as Prisma.InputJsonValue,
          new_value: next as unknown as Prisma.InputJsonValue,
          reason: 'Cập nhật phí di chuyển & phụ phí dịch vụ',
        },
      });
    });

    return next;
  }
}
