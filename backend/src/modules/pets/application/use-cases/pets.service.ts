import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PETS_REPOSITORY } from '../../pets.tokens';
import type { IPetsRepository } from '../ports/pets.repository.port';
import { CreatePetInput, PetRecord, UpdatePetInput } from '../types/pets.types';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';

@Injectable()
export class PetsService {
  constructor(
    @Inject(PETS_REPOSITORY)
    private readonly petsRepository: IPetsRepository,
    private readonly storageService: SupabaseStorageService,
  ) {}

  async create(customerId: string, input: CreatePetInput, file?: Express.Multer.File): Promise<PetRecord> {
    let avatarUrl = input.avatarUrl;
    if (file) {
      const fileName = `${customerId}/${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
      avatarUrl = await this.storageService.uploadFile(file, 'pets', fileName);
    }

    return this.petsRepository.create(customerId, {
      ...input,
      avatarUrl,
    });
  }

  async findAllByCustomer(customerId: string): Promise<PetRecord[]> {
    return this.petsRepository.findByCustomerId(customerId);
  }

  async findOne(id: string, customerId: string): Promise<PetRecord> {
    const pet = await this.petsRepository.findById(id);
    if (!pet) {
      throw new NotFoundException('Pet not found');
    }
    if (pet.customerId !== customerId) {
      throw new ForbiddenException('You do not have permission to access this pet');
    }
    return pet;
  }

  async update(id: string, customerId: string, input: UpdatePetInput, file?: Express.Multer.File): Promise<PetRecord> {
    await this.findOne(id, customerId); // Verify existence and ownership
    
    let avatarUrl = input.avatarUrl;
    if (file) {
      const fileName = `${customerId}/${randomUUID()}-${file.originalname.replace(/\s+/g, '-')}`;
      avatarUrl = await this.storageService.uploadFile(file, 'pets', fileName);
    }

    return this.petsRepository.update(id, {
      ...input,
      ...(avatarUrl && { avatarUrl }),
    });
  }

  async delete(id: string, customerId: string): Promise<void> {
    await this.findOne(id, customerId); // Verify existence and ownership
    await this.petsRepository.delete(id);
  }
}
