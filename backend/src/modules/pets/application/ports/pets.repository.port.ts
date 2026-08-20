import { CreatePetInput, PetRecord, UpdatePetInput } from '../types/pets.types';

export interface IPetsRepository {
  create(customerId: string, data: CreatePetInput): Promise<PetRecord>;
  findById(id: string): Promise<PetRecord | null>;
  findByCustomerId(customerId: string): Promise<PetRecord[]>;
  update(id: string, data: UpdatePetInput): Promise<PetRecord>;
  delete(id: string): Promise<void>;
}
