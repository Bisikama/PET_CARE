import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './application/use-cases/providers.service';
import { PrismaProvidersRepository } from './infrastructure/persistence/prisma-providers.repository';
import { PROVIDERS_REPOSITORY } from './providers.tokens';
import { PrismaModule } from '../../database/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { AdminProvidersController } from './admin-providers.controller';
import { AdminProvidersService } from './application/use-cases/admin-providers.service';
import { EkycService } from './ekyc.service';
import { HttpModule } from '@nestjs/axios';
import { BankAccountsController } from './bank-accounts/bank-accounts.controller';
import { ManageBankAccountsUseCase } from './bank-accounts/manage-bank-accounts.use-case';

@Module({
  imports: [PrismaModule, StorageModule, HttpModule],
  controllers: [ProvidersController, AdminProvidersController, BankAccountsController],
  providers: [
    ProvidersService,
    AdminProvidersService,
    EkycService,
    ManageBankAccountsUseCase,
    {
      provide: PROVIDERS_REPOSITORY,
      useClass: PrismaProvidersRepository,
    },
  ],
  exports: [ProvidersService, AdminProvidersService],
})
export class ProvidersModule {}
