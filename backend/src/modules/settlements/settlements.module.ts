import { Module } from '@nestjs/common';
import { SettlementsController } from './settlements.controller';
import { SettlementsService } from './application/use-cases/settlements.service';
import { WalletsModule } from '../wallets/wallets.module';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [WalletsModule, PrismaModule],
  controllers: [SettlementsController],
  providers: [SettlementsService],
  exports: [SettlementsService],
})
export class SettlementsModule {}
