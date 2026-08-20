import { Module } from '@nestjs/common';
import { PetsController } from './pets.controller';
import { PetsService } from './application/use-cases/pets.service';
import { PrismaPetsRepository } from './infrastructure/persistence/prisma-pets.repository';
import { PETS_REPOSITORY } from './pets.tokens';
import { PrismaModule } from '../../database/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [PetsController],
  providers: [
    PetsService,
    {
      provide: PETS_REPOSITORY,
      useClass: PrismaPetsRepository,
    },
  ],
  exports: [PetsService],
})
export class PetsModule {}
