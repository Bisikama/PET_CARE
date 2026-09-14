export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat';
  breed?: string;
  age?: number;
  weight?: number;
  gender?: string;
  healthNote?: string;
  behaviorNote?: string;
  avatarUrl?: string;
}

export type CreatePetRequest = Omit<Pet, 'id'> & { avatar?: any };
export type UpdatePetRequest = Partial<CreatePetRequest>;

export interface MedicalRecord {
  id: string;
  petId: string;
  recordType: string;
  description: string;
  recordDate: string;
}
