import { Test, TestingModule } from '@nestjs/testing';
import { MedicalRecordsService } from './medical-records.service';
import { PrismaService } from '../../../../database/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { medical_record_type } from '@prisma/client';

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        {
          provide: PrismaService,
          useValue: {
            pets: {
              findUnique: jest.fn(),
            },
            pet_medical_records: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MedicalRecordsService>(MedicalRecordsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a medical record (Happy Path)', async () => {
      const userId = 'user-1';
      const petId = 'pet-1';
      const dto = {
        recordType: medical_record_type.VACCINE,
        description: 'Rabies',
        date: '2026-09-04T00:00:00Z',
      };

      (prismaService.pets.findUnique as jest.Mock).mockResolvedValue({ id: petId, customer_id: userId });
      (prismaService.pet_medical_records.create as jest.Mock).mockResolvedValue({ id: 'record-1' });

      const result = await service.create(userId, petId, dto);

      expect(prismaService.pet_medical_records.create).toHaveBeenCalledWith({
        data: {
          pet_id: petId,
          record_type: dto.recordType,
          description: dto.description,
          date: new Date(dto.date),
          attachments: [],
        },
      });
      expect(result.id).toBe('record-1');
    });

    it('should throw NotFoundException if pet not found', async () => {
      (prismaService.pets.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.create('user-1', 'pet-1', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own pet', async () => {
      (prismaService.pets.findUnique as jest.Mock).mockResolvedValue({ id: 'pet-1', customer_id: 'other-user' });
      await expect(service.create('user-1', 'pet-1', {} as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllByPet', () => {
    it('should return records', async () => {
      const userId = 'user-1';
      const petId = 'pet-1';

      (prismaService.pets.findUnique as jest.Mock).mockResolvedValue({ id: petId, customer_id: userId });
      (prismaService.pet_medical_records.findMany as jest.Mock).mockResolvedValue([{ id: 'record-1' }]);

      const result = await service.findAllByPet(userId, petId);

      expect(prismaService.pet_medical_records.findMany).toHaveBeenCalledWith({
        where: { pet_id: petId },
        orderBy: { date: 'desc' },
      });
      expect(result.length).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete a record', async () => {
      const userId = 'user-1';
      const recordId = 'record-1';

      (prismaService.pet_medical_records.findUnique as jest.Mock).mockResolvedValue({
        id: recordId,
        pet: { customer_id: userId },
      });

      const result = await service.delete(userId, recordId);

      expect(prismaService.pet_medical_records.delete).toHaveBeenCalledWith({ where: { id: recordId } });
      expect(result.message).toBe('Medical record deleted successfully');
    });
  });
});
