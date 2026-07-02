import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { ProviderCoverageController } from './provider-coverage.controller';
import { ManageProviderAreaUseCase } from './application/use-cases/manage-provider-area.use-case';
import { PROVIDER_COVERAGE_REPOSITORY } from './provider-coverage.tokens';
import { PrismaProviderCoverageRepository } from './infrastructure/persistence/prisma-provider-coverage.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ProviderCoverageController],
  providers: [
    ManageProviderAreaUseCase,
    {
      provide: PROVIDER_COVERAGE_REPOSITORY,
      useClass: PrismaProviderCoverageRepository,
    },
  ],
  exports: [PROVIDER_COVERAGE_REPOSITORY, ManageProviderAreaUseCase],
})
export class ProviderCoverageModule {}
