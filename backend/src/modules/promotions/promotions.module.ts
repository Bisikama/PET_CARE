import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { PromotionsController } from './presentation/controllers/promotions.controller';
import { AdminPromotionsController } from './presentation/controllers/admin-promotions.controller';
import { ApplyPromotionUseCase } from './application/use-cases/apply-promotion.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [PromotionsController, AdminPromotionsController],
  providers: [ApplyPromotionUseCase],
  exports: [ApplyPromotionUseCase],
})
export class PromotionsModule {}
