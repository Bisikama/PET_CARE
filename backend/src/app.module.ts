import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './database/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ServicesModule } from './modules/services/services.module';
import { CustomerAddressesModule } from './modules/customer-addresses/customer-addresses.module';
import { ProviderCoverageModule } from './modules/provider-coverage/provider-coverage.module';
import { ServiceDiscoveryModule } from './modules/service-discovery/service-discovery.module';
import { PetsModule } from './modules/pets/pets.module';
import { StorageModule } from './modules/storage/storage.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { CustomerCareModule } from './modules/customer-care/customer-care.module';
import { GrowthModule } from './modules/growth/growth.module';
import { AdminCoreModule } from './modules/admin-core/admin-core.module';
import { AccessTokenGuard } from './common/guards/access-token.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';

import { WalletsModule } from './modules/wallets/wallets.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { SettlementsModule } from './modules/settlements/settlements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: process.env.NODE_ENV === 'test' ? 1000 : 10,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    BookingsModule,
    ServicesModule,
    CustomerAddressesModule,
    ProviderCoverageModule,
    ServiceDiscoveryModule,
    PetsModule,
    StorageModule,
    ProvidersModule,
    CustomerCareModule,
    GrowthModule,
    AdminCoreModule,
    WalletsModule,
    PaymentsModule,
    SettlementsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaClientExceptionFilter,
    },
  ],
})
export class AppModule {}
