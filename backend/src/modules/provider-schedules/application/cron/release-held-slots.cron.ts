import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class ReleaseHeldSlotsCron {
  private readonly logger = new Logger(ReleaseHeldSlotsCron.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running ReleaseHeldSlotsCron to free up expired slots...');

    const now = new Date();

    try {
      const result = await this.prisma.provider_working_slots.updateMany({
        where: {
          status: 'HELD_FOR_PAYMENT',
          held_until: {
            lt: now, // held_until is less than current time
          },
        },
        data: {
          status: 'AVAILABLE',
          held_until: null,
        },
      });

      if (result.count > 0) {
        this.logger.log(`Released ${result.count} expired held slots.`);
      }
    } catch (error) {
      this.logger.error('Failed to release held slots', error);
    }
  }
}
