export type MedicalRecordType = 'VACCINE' | 'ALLERGY' | 'SURGERY';

export interface PetMedicalRecord {
  id: string;
  petId: string;
  recordType: MedicalRecordType;
  description: string;
  date: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalRecordDto {
  recordType: MedicalRecordType;
  description: string;
  date: string;
  attachments?: string[];
}

export interface UpdateMedicalRecordDto extends Partial<CreateMedicalRecordDto> {}
