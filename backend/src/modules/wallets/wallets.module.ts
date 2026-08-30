import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './application/use-cases/wallets.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
