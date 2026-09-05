import { Test, TestingModule } from '@nestjs/testing';
import { SettlementsService } from './settlements.service';
import { PrismaService } from '../../../../database/prisma.service';
import { WalletsService } from '../../../wallets/application/use-cases/wallets.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('SettlementsService', () => {
  let service: SettlementsService;
  let prismaService: any;
  let walletsService: jest.Mocked<WalletsService>;

  beforeEach(async () => {
    const mockPrisma = {
      $transaction: jest.fn((callback) => callback(mockPrisma)),
      payout_requests: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      wallets: {
        findUnique: jest.fn(),
      },
      audit_logs: {
        create: jest.fn(),
      },
      provider_profiles: {
        findUnique: jest.fn(),
      }
    };

    const mockWallets = {
      processTransaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WalletsService, useValue: mockWallets },
      ],
    }).compile();

    service = module.get<SettlementsService>(SettlementsService);
    prismaService = module.get(PrismaService);
    walletsService = module.get(WalletsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('approvePayoutRequest', () => {
    it('should successfully approve a payout request', async () => {
      const adminId = 'admin-1';
      const payoutRequestId = 'req-1';

      const mockRequest = {
        id: payoutRequestId,
        status: 'PAYOUT_PENDING',
        provider_id: 'provider-1',
      };

      const mockProfile = {
        id: 'provider-1',
        user_id: 'user-1',
      };

      const mockWallet = {
        id: 'wallet-1',
        user_id: 'user-1',
      };

      prismaService.payout_requests.findUnique.mockResolvedValueOnce(mockRequest);
      prismaService.provider_profiles.findUnique.mockResolvedValueOnce(mockProfile);
      prismaService.wallets.findUnique.mockResolvedValueOnce(mockWallet);
      prismaService.payout_requests.update.mockResolvedValueOnce({ ...mockRequest, status: 'PAID_OUT' });
      prismaService.audit_logs.create.mockResolvedValueOnce({});

      const result = await service.approvePayoutRequest(adminId, payoutRequestId);

      expect(prismaService.payout_requests.findUnique).toHaveBeenCalledWith({ where: { id: payoutRequestId } });
      expect(prismaService.provider_profiles.findUnique).toHaveBeenCalledWith({ where: { id: 'provider-1' } });
      expect(prismaService.wallets.findUnique).toHaveBeenCalledWith({ where: { user_id: 'user-1' } });
      expect(prismaService.payout_requests.update).toHaveBeenCalledWith({
        where: { id: payoutRequestId },
        data: {
          status: 'PAID_OUT',
          admin_note: `Processed by Admin ${adminId}`,
        },
      });
      expect(prismaService.audit_logs.create).toHaveBeenCalled();
      expect(result.status).toBe('PAID_OUT');
    });

    it('should throw ConflictException if request is not PAYOUT_PENDING', async () => {
      prismaService.payout_requests.findUnique.mockResolvedValueOnce({
        id: 'req-1',
        status: 'PAID_OUT',
      });

      await expect(service.approvePayoutRequest('admin-1', 'req-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('rejectPayoutRequest', () => {
    it('should successfully reject a payout request and refund', async () => {
      const adminId = 'admin-1';
      const payoutRequestId = 'req-1';
      const reason = 'Invalid bank account';

      const mockRequest = {
        id: payoutRequestId,
        status: 'PAYOUT_PENDING',
        provider_id: 'provider-1',
        amount: 1000,
      };

      const mockProfile = {
        id: 'provider-1',
        user_id: 'user-1',
      };

      const mockWallet = {
        id: 'wallet-1',
        user_id: 'user-1',
      };

      prismaService.payout_requests.findUnique.mockResolvedValueOnce(mockRequest);
      prismaService.provider_profiles.findUnique.mockResolvedValueOnce(mockProfile);
      prismaService.wallets.findUnique.mockResolvedValueOnce(mockWallet);
      walletsService.processTransaction.mockResolvedValueOnce({} as any);
      prismaService.payout_requests.update.mockResolvedValueOnce({ ...mockRequest, status: 'FAILED' });

      const result = await service.rejectPayoutRequest(adminId, payoutRequestId, reason);

      expect(walletsService.processTransaction).toHaveBeenCalledWith(
        'wallet-1',
        1000,
        'CREDIT',
        null,
        expect.stringContaining(reason),
        expect.anything()
      );
      expect(prismaService.payout_requests.update).toHaveBeenCalledWith({
        where: { id: payoutRequestId },
        data: {
          status: 'FAILED',
          admin_note: `Rejected by Admin ${adminId}: ${reason}`,
        },
      });
      expect(result.status).toBe('FAILED');
    });

    it('should throw BadRequestException if reason is missing', async () => {
      await expect(service.rejectPayoutRequest('admin-1', 'req-1', '')).rejects.toThrow(BadRequestException);
    });
  });
});
