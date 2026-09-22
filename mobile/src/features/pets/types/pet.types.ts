export interface Pet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: 'Male' | 'Female' | string;
  healthNote?: string;
  behaviorNote?: string;
  avatarUrl?: string;
  avatar_url?: string;
  health_note?: string;
  behavior_note?: string;
  created_at?: string;
}

export interface CreatePetRequest {
  name: string;
  species: 'Dog' | 'Cat' | string;
  breed?: string;
  age?: number;
  weight?: number;
  gender?: 'Male' | 'Female' | string;
  healthNote?: string;
  behaviorNote?: string;
  avatarUrl?: string;
  avatar?: {
    uri: string;
    mimeType?: string;
    fileName?: string;
  };
}

export type UpdatePetRequest = Partial<CreatePetRequest>;

export interface MedicalRecord {
  id: string;
  petId: string;
  recordType: string;
  description: string;
  recordDate: string;
}
