import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationGateway } from './notifications/notification.gateway';
import { PromotionsService } from './promotions/promotions.service';
import { PromotionsController } from './promotions/promotions.controller';
import { AdminPromotionsController } from './promotions/admin-promotions.controller';
import { SubscriptionsService } from './subscriptions/subscriptions.service';
import { SubscriptionsController } from './subscriptions/subscriptions.controller';
import { PrismaModule } from '../../database/prisma.module';

import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [
    NotificationsController,
    PromotionsController,
    AdminPromotionsController,
    SubscriptionsController,
  ],
  providers: [
    NotificationsService,
    NotificationGateway,
    PromotionsService,
    SubscriptionsService,
  ],
  exports: [NotificationsService, NotificationGateway, PromotionsService, SubscriptionsService],
})
export class GrowthModule { }
