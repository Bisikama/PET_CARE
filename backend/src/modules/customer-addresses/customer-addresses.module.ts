import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { CustomerAddressesController } from './customer-addresses.controller';
import { CreateAddressUseCase } from './application/use-cases/create-address.use-case';
import { UpdateAddressUseCase } from './application/use-cases/update-address.use-case';
import { GetAddressesUseCase } from './application/use-cases/get-addresses.use-case';
import { DeleteAddressUseCase } from './application/use-cases/delete-address.use-case';
import { CUSTOMER_ADDRESSES_REPOSITORY } from './customer-addresses.tokens';
import { PrismaCustomerAddressesRepository } from './infrastructure/persistence/prisma-customer-addresses.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerAddressesController],
  providers: [
    CreateAddressUseCase,
    UpdateAddressUseCase,
    GetAddressesUseCase,
    DeleteAddressUseCase,
    {
      provide: CUSTOMER_ADDRESSES_REPOSITORY,
      useClass: PrismaCustomerAddressesRepository,
    },
  ],
  exports: [CUSTOMER_ADDRESSES_REPOSITORY, GetAddressesUseCase],
})
export class CustomerAddressesModule {}
