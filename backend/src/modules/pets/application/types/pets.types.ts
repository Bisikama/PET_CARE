export interface CreatePetInput {
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: string;
  healthNote?: string;
  behaviorNote?: string;
  avatarUrl?: string;
}

export interface UpdatePetInput {
  name?: string;
  species?: string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: string;
  healthNote?: string;
  behaviorNote?: string;
  avatarUrl?: string;
}

export interface PetRecord {
  id: string;
  customerId: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  weight: number | null;
  gender: string | null;
  healthNote: string | null;
  behaviorNote: string | null;
  avatarUrl: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
