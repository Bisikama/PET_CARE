import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './application/use-cases/providers.service';
import { PrismaProvidersRepository } from './infrastructure/persistence/prisma-providers.repository';
import { PROVIDERS_REPOSITORY } from './providers.tokens';
import { PrismaModule } from '../../database/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { AdminProvidersController } from './admin-providers.controller';
import { AdminProvidersService } from './application/use-cases/admin-providers.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [ProvidersController, AdminProvidersController],
  providers: [
    ProvidersService,
    AdminProvidersService,
    {
      provide: PROVIDERS_REPOSITORY,
      useClass: PrismaProvidersRepository,
    },
  ],
  exports: [ProvidersService, AdminProvidersService],
})
export class ProvidersModule {}
