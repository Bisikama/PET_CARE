import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { ServicesController } from './services.controller';
import { CancellationPoliciesController } from './cancellation-policies.controller';
import { CreateServiceUseCase } from './application/use-cases/create-service.use-case';
import { UpdateServiceUseCase } from './application/use-cases/update-service.use-case';
import { DeleteServiceUseCase } from './application/use-cases/delete-service.use-case';
import { GetServicesUseCase } from './application/use-cases/get-services.use-case';
import { ManagePricingRuleUseCase } from './application/use-cases/manage-pricing-rule.use-case';
import { ManageChecklistTemplateUseCase } from './application/use-cases/manage-checklist-template.use-case';
import { ManageCancellationPolicyUseCase } from './application/use-cases/manage-cancellation-policy.use-case';
import { CreateServiceSuggestionUseCase } from './application/use-cases/create-service-suggestion.use-case';
import { SERVICES_REPOSITORY } from './services.tokens';
import { PrismaServicesRepository } from './infrastructure/persistence/prisma-services.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ServicesController, CancellationPoliciesController],
  providers: [
    CreateServiceUseCase,
    UpdateServiceUseCase,
    DeleteServiceUseCase,
    GetServicesUseCase,
    ManagePricingRuleUseCase,
    ManageChecklistTemplateUseCase,
    ManageCancellationPolicyUseCase,
    CreateServiceSuggestionUseCase,
    {
      provide: SERVICES_REPOSITORY,
      useClass: PrismaServicesRepository,
    },
  ],
  exports: [
    SERVICES_REPOSITORY,
    GetServicesUseCase, // Export for discovery module if needed
  ],
})
export class ServicesModule {}
