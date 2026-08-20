import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { CustomerCareController } from './customer-care.controller';
import { AdminCustomerCareController } from './admin-customer-care.controller';
import { ReviewsService } from './application/use-cases/reviews.service';
import { SupportService } from './application/use-cases/support.service';
import { DisputesService } from './application/use-cases/disputes.service';
import { IncidentsService } from './application/use-cases/incidents.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [CustomerCareController, AdminCustomerCareController],
  providers: [
    ReviewsService,
    SupportService,
    DisputesService,
    IncidentsService,
  ],
  exports: [ReviewsService, SupportService, DisputesService, IncidentsService],
})
export class CustomerCareModule {}
