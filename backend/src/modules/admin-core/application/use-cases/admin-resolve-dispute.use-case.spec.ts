import { Test, TestingModule } from '@nestjs/testing';
import { AdminResolveDisputeUseCase } from './admin-resolve-dispute.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { booking_status, complaint_status } from '@prisma/client';

describe('AdminResolveDisputeUseCase', () => {
  let useCase: AdminResolveDisputeUseCase;
  let prisma: PrismaService;
  let settlementsService: SettlementsService;

  const mockPrisma = {
    complaints: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bookings: {
      update: jest.fn(),
    },
    booking_status_logs: {
      create: jest.fn(),
    },
    provider_profiles: {
      update: jest.fn(),
    },
    audit_logs: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockSettlementsService = {
    resolveDisputeSettlement: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminResolveDisputeUseCase,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SettlementsService, useValue: mockSettlementsService },
      ],
    }).compile();

    useCase = module.get<AdminResolveDisputeUseCase>(AdminResolveDisputeUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    settlementsService = module.get<SettlementsService>(SettlementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const defaultInput = {
      adminId: 'admin-1',
      complaintId: 'comp-1',
      customerRefundPercentage: 50,
      resolutionNote: 'Thỏa hiệp 50-50',
    };

    const mockComplaint = {
      id: 'comp-1',
      status: complaint_status.OPEN,
      bookings: {
        id: 'booking-1',
        provider_id: 'provider-1',
        payments: { id: 'payment-1', status: 'ESCROW_ON_HOLD' },
      },
    };

    it('should throw BadRequestException if customerRefundPercentage is invalid', async () => {
      await expect(useCase.execute({ ...defaultInput, customerRefundPercentage: 150 })).rejects.toThrow(BadRequestException);
      await expect(useCase.execute({ ...defaultInput, customerRefundPercentage: -10 })).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if complaint not found', async () => {
      mockPrisma.complaints.findUnique.mockResolvedValueOnce(null);
      await expect(useCase.execute(defaultInput)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if complaint is already resolved', async () => {
      mockPrisma.complaints.findUnique.mockResolvedValueOnce({ ...mockComplaint, status: complaint_status.RESOLVED });
      await expect(useCase.execute(defaultInput)).rejects.toThrow(ConflictException);
    });

    it('TEST CASE 1: Khách thắng toàn phần (Refund 100%) - Có phạt Trust Score', async () => {
      mockPrisma.complaints.findUnique.mockResolvedValueOnce(mockComplaint);
      mockPrisma.complaints.update.mockResolvedValueOnce({ id: 'comp-1' });

      await useCase.execute({ ...defaultInput, customerRefundPercentage: 100, resolutionNote: 'Khách thắng toàn phần' });

      // Verify SettlementsService is called with 100%
      expect(settlementsService.resolveDisputeSettlement).toHaveBeenCalledWith(
        'booking-1',
        100,
        mockPrisma,
        expect.stringContaining('Khách thắng toàn phần'),
      );

      // Verify booking status changed to RESOLVED
      expect(mockPrisma.bookings.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: { status: booking_status.RESOLVED },
      });

      // Verify Trust Score is penalized since 100 > 50
      expect(mockPrisma.provider_profiles.update).toHaveBeenCalledWith({
        where: { user_id: 'provider-1' },
        data: { trust_score: { decrement: 10 } },
      });
    });

    it('TEST CASE 2: Provider thắng toàn phần (Release 100% -> Refund 0%) - Không phạt Trust Score', async () => {
      mockPrisma.complaints.findUnique.mockResolvedValueOnce(mockComplaint);
      mockPrisma.complaints.update.mockResolvedValueOnce({ id: 'comp-1' });

      await useCase.execute({ ...defaultInput, customerRefundPercentage: 0, resolutionNote: 'Provider thắng toàn phần' });

      // Verify SettlementsService is called with 0%
      expect(settlementsService.resolveDisputeSettlement).toHaveBeenCalledWith(
        'booking-1',
        0,
        mockPrisma,
        expect.stringContaining('Provider thắng toàn phần'),
      );

      // Verify Trust Score is NOT penalized since 0 <= 50
      expect(mockPrisma.provider_profiles.update).not.toHaveBeenCalled();
    });

    it('TEST CASE 3: Hòa giải (Chia 50-50) - Không phạt Trust Score', async () => {
      mockPrisma.complaints.findUnique.mockResolvedValueOnce(mockComplaint);
      mockPrisma.complaints.update.mockResolvedValueOnce({ id: 'comp-1' });

      await useCase.execute({ ...defaultInput, customerRefundPercentage: 50, resolutionNote: 'Hòa giải 50-50' });

      // Verify SettlementsService is called with 50%
      expect(settlementsService.resolveDisputeSettlement).toHaveBeenCalledWith(
        'booking-1',
        50,
        mockPrisma,
        expect.stringContaining('Hòa giải 50-50'),
      );

      // Verify Trust Score is NOT penalized since 50 <= 50
      expect(mockPrisma.provider_profiles.update).not.toHaveBeenCalled();
    });
  });
});
