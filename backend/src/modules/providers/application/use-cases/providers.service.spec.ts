import { Test, TestingModule } from '@nestjs/testing';
import { ProvidersService } from './providers.service';
import { PROVIDERS_REPOSITORY } from '../../providers.tokens';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { PrismaService } from '../../../../database/prisma.service';
import { EkycService } from '../../ekyc.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { ProviderDocumentType } from '../../dto/upload-document.dto';
import { Prisma } from '@prisma/client';

describe('ProvidersService', () => {
  let service: ProvidersService;

  const mockProvidersRepository = {
    findProfileByUserId: jest.fn(),
    createProfile: jest.fn(),
    addServiceArea: jest.fn(),
    registerService: jest.fn(),
    addDocument: jest.fn(),
    updateIdentityCardUrl: jest.fn(),
    getBasePriceByServiceId: jest.fn(),
  };

  const mockStorageService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: PROVIDERS_REPOSITORY,
          useValue: mockProvidersRepository,
        },
        {
          provide: SupabaseStorageService,
          useValue: mockStorageService,
        },
        {
          provide: PrismaService,
          useValue: { 
            $transaction: jest.fn((callback) => callback(mockProvidersRepository)),
            provider_profiles: { update: jest.fn() },
            provider_documents: { count: jest.fn() },
          },
        },
        {
          provide: EkycService,
          useValue: { verifyIdentity: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadDocument', () => {
    it('should throw NotFoundException if profile does not exist', async () => {
      mockProvidersRepository.findProfileByUserId.mockResolvedValue(null);

      await expect(
        service.uploadDocument('user-1', { documentType: ProviderDocumentType.GROOMING_CERTIFICATE }, {} as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if file is missing', async () => {
      mockProvidersRepository.findProfileByUserId.mockResolvedValue({ id: 'provider-1' });

      await expect(
        service.uploadDocument('user-1', { documentType: ProviderDocumentType.GROOMING_CERTIFICATE }, undefined as any)
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully upload document and update identityCardUrl', async () => {
      mockProvidersRepository.findProfileByUserId.mockResolvedValue({ id: 'provider-1' });
      const prismaService = (service as any).prisma;
      prismaService.provider_documents.count.mockResolvedValue(0);
      mockStorageService.uploadFile.mockResolvedValue('http://supabase.com/file.pdf');

      const file = { originalname: 'id.pdf', buffer: Buffer.from('test') } as any;
      const dto = { documentType: ProviderDocumentType.GROOMING_CERTIFICATE };

      await service.uploadDocument('user-1', dto, file);

      expect(mockStorageService.uploadFile).toHaveBeenCalled();
      expect(mockProvidersRepository.addDocument).toHaveBeenCalledWith('provider-1', {
        documentType: ProviderDocumentType.GROOMING_CERTIFICATE,
        fileUrl: 'http://supabase.com/file.pdf',
        status: 'PENDING',
      });
    });
  });

  describe('registerCapability', () => {
    it('should throw ConflictException on duplicate service', async () => {
      mockProvidersRepository.findProfileByUserId.mockResolvedValue({ id: 'provider-1', kkycStatus: 'APPROVED', kycStatus: 'APPROVED' });
      mockProvidersRepository.getBasePriceByServiceId.mockResolvedValue(100);

      const error = new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: '5.x' });
      mockProvidersRepository.registerService.mockRejectedValue(error);

      await expect(
        service.registerCapability('user-1', { serviceId: 'svc-1', petSpecies: 'Dog', minWeight: 0, maxWeight: 10 })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateBaseAddress', () => {
    it('should throw NotFoundException if profile does not exist', async () => {
      mockProvidersRepository.findProfileByUserId.mockResolvedValue(null);

      await expect(
        service.updateBaseAddress('user-1', {
          baseAddressLine: '123 Test',
          baseLatitude: 10,
          baseLongitude: 106,
        })
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully update base address', async () => {
      mockProvidersRepository.findProfileByUserId.mockResolvedValue({ id: 'provider-1' });
      const prismaService = (service as any).prisma;
      prismaService.provider_profiles.update.mockResolvedValue({});

      await service.updateBaseAddress('user-1', {
        baseAddressLine: '123 Test',
        baseLatitude: 10,
        baseLongitude: 106,
        serviceRadiusKm: 10,
      });

      expect(prismaService.provider_profiles.update).toHaveBeenCalledWith({
        where: { id: 'provider-1' },
        data: {
          base_address_line: '123 Test',
          base_ward: undefined,
          base_district: undefined,
          base_city: undefined,
          base_latitude: 10,
          base_longitude: 106,
          base_formatted: undefined,
          service_radius_km: 10,
        }
      });
    });
  });
});
