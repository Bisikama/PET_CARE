import { Test, TestingModule } from '@nestjs/testing';
import { PetsController } from './pets.controller';
import { PetsService } from './application/use-cases/pets.service';
import { CreatePetDto, PetSpecies } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { MedicalRecordsService } from './application/use-cases/medical-records.service';

describe('PetsController', () => {
  let controller: PetsController;
  let service: PetsService;

  const mockPetsService = {
    create: jest.fn(),
    findAllByCustomer: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [
        {
          provide: PetsService,
          useValue: mockPetsService,
        },
        {
          provide: MedicalRecordsService,
          useValue: {
            create: jest.fn(),
            findByPetId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PetsController>(PetsController);
    service = module.get<PetsService>(PetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a pet without a file', async () => {
      const dto: CreatePetDto = { name: 'Rex', species: PetSpecies.DOG };
      const userId = 'user-id-1';
      const expectedResult = { id: 'pet-1', ...dto, customerId: userId };
      
      mockPetsService.create.mockResolvedValue(expectedResult);
      
      const result = await controller.create(userId, dto, undefined);
      expect(service.create).toHaveBeenCalledWith(userId, dto, undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should create a pet with a file', async () => {
      const dto: CreatePetDto = { name: 'Rex', species: PetSpecies.DOG };
      const userId = 'user-id-1';
      const mockFile = { originalname: 'avatar.jpg' } as any;
      const expectedResult = { id: 'pet-1', ...dto, customerId: userId, avatarUrl: 'url' };
      
      mockPetsService.create.mockResolvedValue(expectedResult);
      
      const result = await controller.create(userId, dto, mockFile);
      expect(service.create).toHaveBeenCalledWith(userId, dto, mockFile);
      expect(result).toEqual(expectedResult);
    });
  });

  // ... (keep findAll, findOne, delete as they don't use file)
  describe('findAll', () => {
    it('should get all pets for user', async () => {
      const userId = 'user-id-1';
      const expectedResult = [{ id: 'pet-1', customerId: userId }];
      mockPetsService.findAllByCustomer.mockResolvedValue(expectedResult);
      expect(await controller.findAll(userId)).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should get a single pet', async () => {
      const userId = 'user-id-1';
      const petId = 'pet-1';
      const expectedResult = { id: petId, customerId: userId };
      mockPetsService.findOne.mockResolvedValue(expectedResult);
      expect(await controller.findOne(userId, petId)).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a pet without a file', async () => {
      const userId = 'user-id-1';
      const petId = 'pet-1';
      const dto: UpdatePetDto = { name: 'Rex Updated' };
      const expectedResult = { id: petId, customerId: userId, name: 'Rex Updated' };
      
      mockPetsService.update.mockResolvedValue(expectedResult);
      
      const result = await controller.update(userId, petId, dto, undefined);
      expect(service.update).toHaveBeenCalledWith(petId, userId, dto, undefined);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a pet', async () => {
      const userId = 'user-id-1';
      const petId = 'pet-1';
      mockPetsService.delete.mockResolvedValue(undefined);
      expect(await controller.remove(userId, petId)).toBeUndefined();
    });
  });
});
