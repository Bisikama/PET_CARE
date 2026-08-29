import { Test, TestingModule } from '@nestjs/testing';
import { DisputesService } from './disputes.service';
import { PrismaService } from '../../../../database/prisma.service';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { ResolveDisputeDto } from '../../dto/dispute.dto';
import { booking_status, complaint_status } from '@prisma/client';

describe('DisputesService', () => {
  let service: DisputesService;
  let settlementsService: SettlementsService;

  const mockPrisma = {
    complaints: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockTx)),
  };

  const mockTx = {
    complaints: { update: jest.fn() },
    bookings: { update: jest.fn() },
    booking_status_logs: { create: jest.fn() },
    audit_logs: { create: jest.fn() },
  };

  const mockStorage = {
    uploadFile: jest.fn(),
  };

  const mockSettlements = {
    refund: jest.fn(),
    releaseEscrow: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SupabaseStorageService, useValue: mockStorage },
        { provide: SettlementsService, useValue: mockSettlements },
      ],
    }).compile();

    service = module.get<DisputesService>(DisputesService);
    settlementsService = module.get<SettlementsService>(SettlementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resolveDispute', () => {
    const adminId = 'admin-123';
    const complaintId = 'complaint-1';
    const bookingId = 'booking-1';

    beforeEach(() => {
      mockPrisma.complaints.findUnique.mockResolvedValue({
        id: complaintId,
        booking_id: bookingId,
        status: complaint_status.OPEN,
      });
    });

    it('should call settlementsService.refund when decision is FULL_REFUND', async () => {
      const dto: ResolveDisputeDto = { decision: 'FULL_REFUND', resolutionNote: 'Refund money' };
      
      await service.resolveDispute(adminId, complaintId, dto);

      expect(mockSettlements.refund).toHaveBeenCalledWith(
        bookingId,
        mockTx,
        expect.stringContaining('Refund money')
      );
    });

    it('should call settlementsService.releaseEscrow when decision is RELEASE_TO_PROVIDER', async () => {
      const dto: ResolveDisputeDto = { decision: 'RELEASE_TO_PROVIDER', resolutionNote: 'Provider was right' };
      
      await service.resolveDispute(adminId, complaintId, dto);

      expect(mockSettlements.releaseEscrow).toHaveBeenCalledWith(
        bookingId,
        mockTx
      );
    });
  });
});
