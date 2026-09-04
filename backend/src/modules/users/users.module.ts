import { Module } from '@nestjs/common';
import { UsersService } from './application/use-cases/users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../database/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { UserCleanupCronService } from './application/use-cases/user-cleanup.cron';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [UsersController],
  providers: [UsersService, UserCleanupCronService, DeleteAccountUseCase],
  exports: [UsersService],
})
export class UsersModule {}
