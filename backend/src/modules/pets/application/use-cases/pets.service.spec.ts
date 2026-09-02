import { Test, TestingModule } from '@nestjs/testing';
import { PetsService } from './pets.service';
import { PETS_REPOSITORY } from '../../pets.tokens';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PetSpecies } from '../../dto/create-pet.dto';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';

describe('PetsService', () => {
  let service: PetsService;

  const mockPetsRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByCustomerId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockSupabaseStorageService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        {
          provide: PETS_REPOSITORY,
          useValue: mockPetsRepository,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockSupabaseStorageService,
        },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a pet without a file', async () => {
      const input = { name: 'Milo', species: PetSpecies.CAT };
      const expectedPet = { id: 'pet-1', customerId: 'user-1', ...input, avatarUrl: undefined };
      mockPetsRepository.create.mockResolvedValue(expectedPet);

      const result = await service.create('user-1', input);
      expect(result).toEqual(expectedPet);
      expect(mockSupabaseStorageService.uploadFile).not.toHaveBeenCalled();
      expect(mockPetsRepository.create).toHaveBeenCalledWith('user-1', { ...input, avatarUrl: undefined });
    });

    it('should successfully create a pet with an uploaded file', async () => {
      const input = { name: 'Milo', species: PetSpecies.CAT };
      const expectedPet = { id: 'pet-1', customerId: 'user-1', ...input, avatarUrl: 'http://supabase.com/avatar.jpg' };
      const mockFile = { originalname: 'avatar.jpg', buffer: Buffer.from('test') } as any;
      
      mockSupabaseStorageService.uploadFile.mockResolvedValue('http://supabase.com/avatar.jpg');
      mockPetsRepository.create.mockResolvedValue(expectedPet);

      const result = await service.create('user-1', input, mockFile);
      expect(result).toEqual(expectedPet);
      expect(mockSupabaseStorageService.uploadFile).toHaveBeenCalled();
      expect(mockPetsRepository.create).toHaveBeenCalledWith('user-1', { ...input, avatarUrl: 'http://supabase.com/avatar.jpg' });
    });
  });

  describe('findOne', () => {
    it('should return a pet if exists and owned by user', async () => {
      const pet = { id: 'pet-1', customerId: 'user-1' };
      mockPetsRepository.findById.mockResolvedValue(pet);

      const result = await service.findOne('pet-1', 'user-1');
      expect(result).toEqual(pet);
    });

    it('should throw NotFoundException if pet does not exist', async () => {
      mockPetsRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('pet-xxx', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if pet belongs to another user', async () => {
      const pet = { id: 'pet-1', customerId: 'user-2' };
      mockPetsRepository.findById.mockResolvedValue(pet);

      await expect(service.findOne('pet-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update pet without file', async () => {
      const pet = { id: 'pet-1', customerId: 'user-1', name: 'OldName' };
      const updateInput = { name: 'NewName' };
      const updatedPet = { ...pet, ...updateInput };

      mockPetsRepository.findById.mockResolvedValue(pet);
      mockPetsRepository.update.mockResolvedValue(updatedPet);

      const result = await service.update('pet-1', 'user-1', updateInput);
      expect(result).toEqual(updatedPet);
      expect(mockSupabaseStorageService.uploadFile).not.toHaveBeenCalled();
      expect(mockPetsRepository.update).toHaveBeenCalledWith('pet-1', updateInput);
    });

    it('should update pet with file', async () => {
      const pet = { id: 'pet-1', customerId: 'user-1', name: 'OldName' };
      const updateInput = { name: 'NewName' };
      const mockFile = { originalname: 'avatar.jpg', buffer: Buffer.from('test') } as any;
      const updatedPet = { ...pet, ...updateInput, avatarUrl: 'http://supabase.com/avatar.jpg' };

      mockPetsRepository.findById.mockResolvedValue(pet);
      mockSupabaseStorageService.uploadFile.mockResolvedValue('http://supabase.com/avatar.jpg');
      mockPetsRepository.update.mockResolvedValue(updatedPet);

      const result = await service.update('pet-1', 'user-1', updateInput, mockFile);
      expect(result).toEqual(updatedPet);
      expect(mockSupabaseStorageService.uploadFile).toHaveBeenCalled();
      expect(mockPetsRepository.update).toHaveBeenCalledWith('pet-1', { ...updateInput, avatarUrl: 'http://supabase.com/avatar.jpg' });
    });
  });
});
