import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { Prisma } from '@prisma/client';
import { wallet_transaction_type } from '@prisma/client';
import { PrismaService } from '../../../../database/prisma.service';

describe('WalletsService (Ledger Logic)', () => {
  let service: WalletsService;
  
  // Mock Prisma Transaction Client
  let txMock: any;

  beforeEach(async () => {
    const mockPrismaService = {
      $transaction: jest.fn((callback) => callback(txMock)),
      wallets: {
        findUnique: jest.fn(),
      },
      payout_requests: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WalletsService>(WalletsService);

    txMock = {
      wallets: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      wallet_transactions: {
        create: jest.fn(),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processTransaction', () => {
    const walletId = 'wallet-123';
    const amountDecimal = new Prisma.Decimal(100.50);
    const mockWallet = {
      id: walletId,
      balance: new Prisma.Decimal(500),
      pending_balance: new Prisma.Decimal(200),
    };

    beforeEach(() => {
      txMock.wallets.findUnique.mockResolvedValue(mockWallet);
      txMock.$queryRaw.mockResolvedValue([mockWallet]);
      txMock.wallets.update.mockImplementation(({ data }) => {
        return {
          ...mockWallet,
          // Extract increment/decrement values for mocking
          balance: data.balance?.increment 
            ? mockWallet.balance.plus(data.balance.increment)
            : data.balance?.decrement
              ? mockWallet.balance.minus(data.balance.decrement)
              : mockWallet.balance,
          pending_balance: data.pending_balance?.increment
            ? mockWallet.pending_balance.plus(data.pending_balance.increment)
            : data.pending_balance?.decrement
              ? mockWallet.pending_balance.minus(data.pending_balance.decrement)
              : mockWallet.pending_balance,
        };
      });
      txMock.wallet_transactions.create.mockResolvedValue({ id: 'txn-1' });
    });

    it('CREDIT: should apply pessimistic lock and increase balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.CREDIT, null, null, txMock);

      expect(txMock.$queryRaw).toHaveBeenCalled();
      const queryCall = txMock.$queryRaw.mock.calls[0][0] as string[];
      // Due to Prisma's tagged template literal handling, the query strings are in an array.
      // We can assert the string part of it to verify FOR UPDATE exists
      const fullQueryString = queryCall.join('?');
      expect(fullQueryString).toContain('FOR UPDATE');

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          balance: { increment: amountDecimal },
          pending_balance: { increment: new Prisma.Decimal(0) },
        },
      });
    });

    it('DEBIT: should decrease balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.DEBIT, null, null, txMock);

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          balance: { increment: amountDecimal.negated() },
          pending_balance: { increment: new Prisma.Decimal(0) },
        },
      });
    });

    it('PAYOUT: should decrease balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.PAYOUT, null, null, txMock);

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          balance: { increment: amountDecimal.negated() },
          pending_balance: { increment: new Prisma.Decimal(0) },
        },
      });
    });

    it('ESCROW_HOLD: should increase pending_balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.ESCROW_HOLD, null, null, txMock);

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          balance: { increment: new Prisma.Decimal(0) },
          pending_balance: { increment: amountDecimal },
        },
      });
    });

    it('ESCROW_RELEASE: should decrease pending_balance and increase balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.ESCROW_RELEASE, null, null, txMock);

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          balance: { increment: amountDecimal },
          pending_balance: { increment: amountDecimal.negated() },
        },
      });
    });

    it('should throw error if resulting balance is negative (Insufficient funds)', async () => {
      txMock.$queryRaw.mockResolvedValue([{
        id: walletId,
        balance: new Prisma.Decimal(50), // Balance is 50, but we will deduct 100.50
        pending_balance: new Prisma.Decimal(0),
      }]);

      await expect(
        service.processTransaction(walletId, amountDecimal, wallet_transaction_type.DEBIT, null, null, txMock)
      ).rejects.toThrow(`S\u1ed1 d\u01b0 kh\u1ea3 d\u1ee5ng kh\u00f4ng \u0111\u1ee7 trong v\u00ed ${walletId}`); // "Số dư khả dụng không đủ trong ví"
    });
  });
});
