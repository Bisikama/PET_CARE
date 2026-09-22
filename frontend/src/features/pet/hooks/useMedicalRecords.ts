import { useEffect } from 'react';
import { useMedicalRecordStore } from '../stores/medical-record.store';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from '../types/medical-record.types';

export const useMedicalRecords = (petId?: string) => {
  const {
    recordsByPetId,
    selectedRecord,
    isLoading,
    isSubmitting,
    isOpen,
    error,
    openModal,
    closeModal,
    fetchMedicalRecords,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
  } = useMedicalRecordStore();

  useEffect(() => {
    if (petId) {
      fetchMedicalRecords(petId);
    }
  }, [petId, fetchMedicalRecords]);

  const records = petId ? recordsByPetId[petId] || [] : [];

  const handleCreate = async (dto: CreateMedicalRecordDto) => {
    if (!petId) return false;
    return await createMedicalRecord(petId, dto);
  };

  const handleUpdate = async (recordId: string, dto: UpdateMedicalRecordDto) => {
    return await updateMedicalRecord(recordId, dto);
  };

  const handleDelete = async (recordId: string) => {
    if (!petId) return false;
    return await deleteMedicalRecord(recordId, petId);
  };

  const refetch = () => {
    if (petId) fetchMedicalRecords(petId, true);
  };

  return {
    records,
    selectedRecord,
    isLoading,
    isSubmitting,
    isOpen,
    error,
    openModal,
    closeModal,
    createRecord: handleCreate,
    updateRecord: handleUpdate,
    deleteRecord: handleDelete,
    refetch,
  };
};
