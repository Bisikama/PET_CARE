import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './application/use-cases/payments.service';
import { WalletsModule } from '../wallets/wallets.module';
import { PrismaModule } from '../../database/prisma.module';
import { GrowthModule } from '../growth/growth.module';

@Module({
  imports: [WalletsModule, PrismaModule, GrowthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
