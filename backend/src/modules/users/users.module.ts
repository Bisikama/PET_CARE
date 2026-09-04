import { Module } from '@nestjs/common';
import { UsersService } from './application/use-cases/users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../../database/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { UserCleanupCronService } from './application/use-cases/user-cleanup.cron';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case';
import { DeactivateAccountUseCase } from './application/use-cases/deactivate-account.use-case';
import { ProcessDeactivationCron } from './application/cron/process-deactivation.cron';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [UsersController],
  providers: [UsersService, UserCleanupCronService, DeleteAccountUseCase, DeactivateAccountUseCase, ProcessDeactivationCron],
  exports: [UsersService],
})
export class UsersModule {}
