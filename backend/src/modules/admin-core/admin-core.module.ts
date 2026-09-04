import { Module } from '@nestjs/common';
import { AdminCoreService } from './application/use-cases/admin-core.service';
import { AdminCoreController } from './admin-core.controller';
import { PrismaModule } from '../../database/prisma.module';
import { SettlementsModule } from '../settlements/settlements.module';
import { GrowthModule } from '../growth/growth.module';

@Module({
  imports: [PrismaModule, SettlementsModule, GrowthModule],
  controllers: [AdminCoreController],
  providers: [AdminCoreService],
  exports: [AdminCoreService],
})
export class AdminCoreModule {}
