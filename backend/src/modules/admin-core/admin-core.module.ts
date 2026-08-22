import { Module } from '@nestjs/common';
import { AdminCoreService } from './admin-core.service';
import { AdminCoreController } from './admin-core.controller';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminCoreController],
  providers: [AdminCoreService],
  exports: [AdminCoreService],
})
export class AdminCoreModule {}
