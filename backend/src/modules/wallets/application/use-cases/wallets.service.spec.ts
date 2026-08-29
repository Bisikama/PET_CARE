import { Test, TestingModule } from '@nestjs/testing';
import { WalletsService } from './wallets.service';
import { Prisma } from '@prisma/client';
import { wallet_transaction_type } from '@prisma/client';

describe('WalletsService (Ledger Logic)', () => {
  let service: WalletsService;
  
  // Mock Prisma Transaction Client
  let txMock: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletsService],
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

    it('CREDIT: should increase balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.CREDIT, null, null, txMock);

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          balance: { increment: amountDecimal },
        },
      });
    });

    it('DEBIT: should decrease balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.DEBIT, null, null, txMock);

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          balance: { decrement: amountDecimal },
        },
      });
    });

    it('PAYOUT: should decrease balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.PAYOUT, null, null, txMock);

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          balance: { decrement: amountDecimal },
        },
      });
    });

    it('ESCROW_HOLD: should increase pending_balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.ESCROW_HOLD, null, null, txMock);

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          pending_balance: { increment: amountDecimal },
        },
      });
    });

    it('ESCROW_RELEASE: should decrease pending_balance and increase balance', async () => {
      await service.processTransaction(walletId, amountDecimal, wallet_transaction_type.ESCROW_RELEASE, null, null, txMock);

      expect(txMock.wallets.update).toHaveBeenCalledWith({
        where: { id: walletId },
        data: {
          pending_balance: { decrement: amountDecimal },
          balance: { increment: amountDecimal },
        },
      });
    });

    it('should throw error if resulting balance is negative (Insufficient funds)', async () => {
      txMock.wallets.update.mockResolvedValue({
        ...mockWallet,
        balance: new Prisma.Decimal(-50), // Mocking a negative result
      });

      await expect(
        service.processTransaction(walletId, amountDecimal, wallet_transaction_type.DEBIT, null, null, txMock)
      ).rejects.toThrow(`Insufficient funds in wallet ${walletId}`);
    });
  });
});
