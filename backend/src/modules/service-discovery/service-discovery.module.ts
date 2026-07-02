import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { ServiceDiscoveryController } from './service-discovery.controller';
import { DiscoverPackagesUseCase } from './application/use-cases/discover-packages.use-case';
import { DiscoverProvidersUseCase } from './application/use-cases/discover-providers.use-case';
import { SERVICE_DISCOVERY_REPOSITORY } from './service-discovery.tokens';
import { PrismaServiceDiscoveryRepository } from './infrastructure/persistence/prisma-service-discovery.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceDiscoveryController],
  providers: [
    DiscoverPackagesUseCase,
    DiscoverProvidersUseCase,
    {
      provide: SERVICE_DISCOVERY_REPOSITORY,
      useClass: PrismaServiceDiscoveryRepository,
    },
  ],
  exports: [SERVICE_DISCOVERY_REPOSITORY, DiscoverPackagesUseCase, DiscoverProvidersUseCase],
})
export class ServiceDiscoveryModule {}
