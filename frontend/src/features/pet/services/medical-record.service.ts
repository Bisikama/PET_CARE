import axiosInstance from '@/lib/axios';
import { CreateMedicalRecordDto, PetMedicalRecord, UpdateMedicalRecordDto } from '../types/medical-record.types';

export const medicalRecordService = {
  getMedicalRecords: async (petId: string): Promise<PetMedicalRecord[]> => {
    const response = await axiosInstance.get<PetMedicalRecord[]>(`/pets/${petId}/medical-records`);
    return response.data;
  },

  createMedicalRecord: async (petId: string, dto: CreateMedicalRecordDto): Promise<PetMedicalRecord> => {
    const response = await axiosInstance.post<PetMedicalRecord>(`/pets/${petId}/medical-records`, dto);
    return response.data;
  },

  updateMedicalRecord: async (recordId: string, dto: UpdateMedicalRecordDto): Promise<PetMedicalRecord> => {
    const response = await axiosInstance.put<PetMedicalRecord>(`/pets/medical-records/${recordId}`, dto);
    return response.data;
  },

  deleteMedicalRecord: async (recordId: string): Promise<void> => {
    await axiosInstance.delete(`/pets/medical-records/${recordId}`);
  },
};
