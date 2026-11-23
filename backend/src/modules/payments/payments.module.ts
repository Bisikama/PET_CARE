import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './application/use-cases/payments.service';
import { SepayController } from './sepay.controller';
import { SepayService } from './application/use-cases/sepay.service';
import { WalletsModule } from '../wallets/wallets.module';
import { PrismaModule } from '../../database/prisma.module';
import { GrowthModule } from '../growth/growth.module';

@Module({
  imports: [WalletsModule, PrismaModule, GrowthModule],
  controllers: [PaymentsController, SepayController],
  providers: [PaymentsService, SepayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
