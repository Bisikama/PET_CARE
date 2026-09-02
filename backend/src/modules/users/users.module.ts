import { Module } from '@nestjs/common';
import { UsersService } from './application/use-cases/users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../database/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { UserCleanupCronService } from './application/use-cases/user-cleanup.cron';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [UsersController],
  providers: [UsersService, UserCleanupCronService],
  exports: [UsersService],
})
export class UsersModule {}
