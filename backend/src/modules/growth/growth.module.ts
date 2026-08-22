import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';
import { PromotionsService } from './promotions/promotions.service';
import { PromotionsController } from './promotions/promotions.controller';
import { AdminPromotionsController } from './promotions/admin-promotions.controller';
import { SubscriptionsService } from './subscriptions/subscriptions.service';
import { SubscriptionsController } from './subscriptions/subscriptions.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    NotificationsController,
    PromotionsController,
    AdminPromotionsController,
    SubscriptionsController,
  ],
  providers: [
    NotificationsService,
    PromotionsService,
    SubscriptionsService,
  ],
  exports: [NotificationsService, PromotionsService, SubscriptionsService],
})
export class GrowthModule {}
