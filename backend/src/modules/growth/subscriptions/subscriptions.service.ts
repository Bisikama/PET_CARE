import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscribeDto } from './dto/subscribe.dto';
import { subscription_status } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async subscribe(userId: string, dto: SubscribeDto) {
    // Check if user already has an active subscription
    const activeSub = await this.prisma.subscriptions.findFirst({
      where: {
        user_id: userId,
        status: subscription_status.ACTIVE,
        end_date: { gt: new Date() },
      },
    });

    if (activeSub) {
      throw new ConflictException('Bạn đã có gói đăng ký đang hoạt động');
    }

    // Mock successful payment, create subscription for 30 days
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await this.prisma.subscriptions.create({
      data: {
        user_id: userId,
        tier_name: dto.tierName,
        start_date: startDate,
        end_date: endDate,
        status: subscription_status.ACTIVE,
      },
    });

    return subscription;
  }

  async getMySubscription(userId: string) {
    const subscription = await this.prisma.subscriptions.findFirst({
      where: {
        user_id: userId,
        status: subscription_status.ACTIVE,
      },
      orderBy: {
        end_date: 'desc',
      },
    });

    if (!subscription) {
      throw new NotFoundException('Không tìm thấy gói đăng ký nào');
    }

    return subscription;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    this.logger.log('Bắt đầu quét các gói Subscription đã hết hạn...');
    const now = new Date();
    
    const { count } = await this.prisma.subscriptions.updateMany({
      where: {
        status: subscription_status.ACTIVE,
        end_date: { lt: now },
      },
      data: {
        status: subscription_status.EXPIRED,
      },
    });

    this.logger.log(`Đã cập nhật trạng thái EXPIRED cho ${count} gói.`);
  }
}
