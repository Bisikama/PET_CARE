import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { notification_type } from '@prisma/client';

export interface NotificationMailContext {
  title: string;
  content: string;
  userName: string;
  type: notification_type;
  bookingId?: string;
  ctaLink?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendNotificationEmail(to: string, context: NotificationMailContext) {
    try {
      await this.mailerService.sendMail({
        to,
        subject: `[Pet Care] ${context.title}`,
        template: 'notification', // will use notification.hbs
        context, // variables for handlebars
      });
      this.logger.log(`[Email Sent] Successfully sent notification email to ${to}`);
    } catch (error) {
      this.logger.error(`[Email Failed] Failed to send email to ${to}`, (error as Error).stack);
      // We don't throw here to ensure fault tolerance.
      // The caller will use fire-and-forget, but handling it here also prevents unhandled promise rejections.
    }
  }
}
