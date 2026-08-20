import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { IPetsRepository } from '../../application/ports/pets.repository.port';
import { CreatePetInput, PetRecord, UpdatePetInput } from '../../application/types/pets.types';
import { pets } from '@prisma/client';

@Injectable()
export class PrismaPetsRepository implements IPetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToRecord(entity: pets): PetRecord {
    return {
      id: entity.id,
      customerId: entity.customer_id,
      name: entity.name,
      species: entity.species,
      breed: entity.breed,
      age: entity.age,
      weight: entity.weight ? entity.weight.toNumber() : null,
      gender: entity.gender,
      healthNote: entity.health_note,
      behaviorNote: entity.behavior_note,
      avatarUrl: entity.avatar_url,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  async create(customerId: string, data: CreatePetInput): Promise<PetRecord> {
    const pet = await this.prisma.pets.create({
      data: {
        customer_id: customerId,
        name: data.name,
        species: data.species,
        breed: data.breed,
        age: data.age,
        weight: data.weight,
        gender: data.gender,
        health_note: data.healthNote,
        behavior_note: data.behaviorNote,
        avatar_url: data.avatarUrl,
      },
    });

    return this.mapToRecord(pet);
  }

  async findById(id: string): Promise<PetRecord | null> {
    const pet = await this.prisma.pets.findUnique({
      where: { id },
    });

    if (!pet) return null;
    return this.mapToRecord(pet);
  }

  async findByCustomerId(customerId: string): Promise<PetRecord[]> {
    const petsData = await this.prisma.pets.findMany({
      where: { customer_id: customerId },
      orderBy: { created_at: 'desc' },
    });

    return petsData.map((pet) => this.mapToRecord(pet));
  }

  async update(id: string, data: UpdatePetInput): Promise<PetRecord> {
    const pet = await this.prisma.pets.update({
      where: { id },
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed,
        age: data.age,
        weight: data.weight,
        gender: data.gender,
        health_note: data.healthNote,
        behavior_note: data.behaviorNote,
        avatar_url: data.avatarUrl,
      },
    });

    return this.mapToRecord(pet);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pets.delete({
      where: { id },
    });
  }
}
