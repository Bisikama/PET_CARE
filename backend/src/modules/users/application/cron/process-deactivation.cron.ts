import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../../database/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ProcessDeactivationCron {
  private readonly logger = new Logger(ProcessDeactivationCron.name);

  constructor(private readonly prisma: PrismaService) {}

  // Run once a day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.debug('Running ProcessDeactivationCron to process 30-day pending deactivation requests...');

    // Find requests that have been pending for 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const pendingRequests = await this.prisma.account_deactivation_requests.findMany({
        where: {
          status: 'PENDING',
          requested_at: {
            lte: thirtyDaysAgo,
          },
        },
      });

      if (pendingRequests.length === 0) {
        return;
      }

      this.logger.log(`Found ${pendingRequests.length} pending deactivation requests older than 30 days. Processing...`);

      for (const request of pendingRequests) {
        await this.prisma.$transaction(async (tx) => {
          // Update request to APPROVED
          await tx.account_deactivation_requests.update({
            where: { id: request.id },
            data: {
              status: 'APPROVED',
              processed_at: new Date(),
              admin_note: 'Auto-approved after 30 days',
            },
          });

          // Perform soft delete on the User by removing their roles and scrambling their data, 
          // or setting a deleted_at flag if it exists. We'll set email to a scrambled one and remove roles.
          // Alternatively, just mark them inactive if there is an inactive flag.
          // Based on the schema, User doesn't have a direct deleted_at, but we can set roles to an empty array
          // or scramble the email to soft delete. Let's just update the email to deleted_{id}@example.com 
          // and reset roles so they can't login.
          await tx.user.update({
            where: { id: request.user_id },
            data: {
              email: `deleted_${request.user_id}@petcare.local`,
              phone: null,
              isActive: false,
            },
          });
        }); // Close transaction
        
        this.logger.log(`Successfully processed deactivation request ${request.id} for user ${request.user_id}`);
      }
    } catch (error) {
      this.logger.error('Failed to process deactivation requests', error);
    }
  }
}
