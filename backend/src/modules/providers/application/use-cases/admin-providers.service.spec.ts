import { Test, TestingModule } from '@nestjs/testing';
import { AdminProvidersService } from './admin-providers.service';
import { PrismaService } from '../../../../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { provider_status, screening_status, provider_document_status, Role } from '@prisma/client';

describe('AdminProvidersService', () => {
  let service: AdminProvidersService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: jest.fn(async (callback) => {
      return callback(mockPrisma);
    }),
    provider_profiles: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    audit_logs: {
      create: jest.fn(),
    },
    trust_badges: {
      findUnique: jest.fn(),
    },
    provider_trust_badges: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    provider_documents: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProvidersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminProvidersService>(AdminProvidersService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('approveProvider', () => {
    it('should throw NotFoundException if profile not found', async () => {
      mockPrisma.provider_profiles.findUnique.mockResolvedValue(null);
      await expect(service.approveProvider('admin1', 'provider1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if kyc_status is not APPROVED', async () => {
      mockPrisma.provider_profiles.findUnique.mockResolvedValue({
        id: 'provider1',
        kyc_status: provider_document_status.PENDING,
        screening_status: screening_status.PASSED
      });
      await expect(service.approveProvider('admin1', 'provider1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if screening_status is not PASSED', async () => {
      mockPrisma.provider_profiles.findUnique.mockResolvedValue({
        id: 'provider1',
        kyc_status: provider_document_status.APPROVED,
        screening_status: screening_status.PENDING
      });
      await expect(service.approveProvider('admin1', 'provider1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no approved documents exist', async () => {
      mockPrisma.provider_profiles.findUnique.mockResolvedValue({
        id: 'provider1',
        user_id: 'user1',
        status: provider_status.PENDING_REVIEW,
        kyc_status: provider_document_status.APPROVED,
        screening_status: screening_status.PASSED
      });
      mockPrisma.provider_documents.count.mockResolvedValue(0);

      await expect(service.approveProvider('admin1', 'provider1')).rejects.toThrow(BadRequestException);
    });

    it('should successfully approve provider if conditions are met', async () => {
      mockPrisma.provider_profiles.findUnique.mockResolvedValue({
        id: 'provider1',
        user_id: 'user1',
        status: provider_status.PENDING_REVIEW,
        kyc_status: provider_document_status.APPROVED,
        screening_status: screening_status.PASSED
      });
      mockPrisma.provider_documents.count.mockResolvedValue(1);

      await service.approveProvider('admin1', 'provider1');

      expect(mockPrisma.provider_profiles.update).toHaveBeenCalledWith({
        where: { id: 'provider1' },
        data: { status: provider_status.APPROVED },
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { role: Role.PROVIDER },
      });
      expect(mockPrisma.audit_logs.create).toHaveBeenCalled();
    });
  });

  describe('getProviders', () => {
    it('should return paginated providers', async () => {
      mockPrisma.provider_profiles.count.mockResolvedValue(1);
      mockPrisma.provider_profiles.findMany.mockResolvedValue([{ id: 'provider1' }]);

      const result = await service.getProviders('admin1', { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('rejectProvider', () => {
    it('should reject provider and demote user role', async () => {
      mockPrisma.provider_profiles.findUnique.mockResolvedValue({
        id: 'provider1',
        user_id: 'user1',
        status: provider_status.APPROVED
      });

      await service.rejectProvider('admin1', 'provider1', 'Fraud');

      expect(mockPrisma.provider_profiles.update).toHaveBeenCalledWith({
        where: { id: 'provider1' },
        data: { status: provider_status.REJECTED }
      });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { role: Role.CUSTOMER }
      });
    });
  });

  describe('reviewDocument', () => {
    it('should throw NotFoundException if document not found', async () => {
      mockPrisma.provider_documents.findUnique = jest.fn().mockResolvedValue(null);
      await expect(service.reviewDocument('admin1', 'doc1', { status: provider_document_status.APPROVED, rejectReason: '' })).rejects.toThrow(NotFoundException);
    });

    it('should update document and auto-sync screening if document type is BACKGROUND_SCREENING and status is APPROVED', async () => {
      mockPrisma.provider_documents.findUnique = jest.fn().mockResolvedValue({ id: 'doc1', provider_id: 'provider1', document_type: 'BACKGROUND_SCREENING' });
      mockPrisma.provider_profiles.findUnique = jest.fn().mockResolvedValue({
        id: 'provider1', kyc_status: provider_document_status.PENDING, screening_status: screening_status.PENDING
      });

      await service.reviewDocument('admin1', 'doc1', { status: provider_document_status.APPROVED, rejectReason: '' });

      expect(mockPrisma.provider_documents.update).toHaveBeenCalledWith({
        where: { id: 'doc1' },
        data: expect.objectContaining({ status: provider_document_status.APPROVED }),
      });
      expect(mockPrisma.provider_profiles.update).toHaveBeenCalledWith({
        where: { id: 'provider1' },
        data: { screening_status: screening_status.PASSED },
      });
    });
  });

  describe('reviewBulkKyc', () => {
    it('should update all pending documents and profile kyc status', async () => {
      mockPrisma.provider_profiles.findUnique = jest.fn().mockResolvedValue({ id: 'provider1', kyc_status: provider_document_status.PENDING });
      
      await service.reviewBulkKyc('admin1', 'provider1', { status: provider_document_status.APPROVED, rejectReason: '' });

      expect(mockPrisma.provider_documents.updateMany).toHaveBeenCalledWith({
        where: { provider_id: 'provider1', status: provider_document_status.PENDING },
        data: expect.objectContaining({ status: provider_document_status.APPROVED }),
      });
      expect(mockPrisma.provider_profiles.update).toHaveBeenCalledWith({
        where: { id: 'provider1' },
        data: { kyc_status: provider_document_status.APPROVED },
      });
    });
  });
});
