import { Module } from '@nestjs/common';
import { AdminCoreService } from './application/use-cases/admin-core.service';
import { AdminCoreController } from './admin-core.controller';
import { PrismaModule } from '../../database/prisma.module';
import { SettlementsModule } from '../settlements/settlements.module';
import { GrowthModule } from '../growth/growth.module';
import { AdminResolveDisputeUseCase } from './application/use-cases/admin-resolve-dispute.use-case';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, SettlementsModule, GrowthModule, StorageModule],
  controllers: [AdminCoreController],
  providers: [AdminCoreService, AdminResolveDisputeUseCase],
  exports: [AdminCoreService, AdminResolveDisputeUseCase],
})
export class AdminCoreModule {}
