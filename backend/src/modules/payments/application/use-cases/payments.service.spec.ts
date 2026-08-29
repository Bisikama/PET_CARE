import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../database/prisma.service';
import { WalletsService } from '../../../wallets/application/use-cases/wallets.service';
import { BadRequestException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let config: ConfigService;

  const mockPrisma = {
    promotions: {
      findUnique: jest.fn(),
    },
    payments: {
      create: jest.fn(),
    },
    bookings: {
      findUnique: jest.fn(),
    },
  };

  const mockWallets = {
    processTransaction: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn().mockReturnValue('mock-value'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: WalletsService, useValue: mockWallets },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createVNPayUrl with Promotion', () => {
    const bookingId = 'booking-123';
    const amount = 100000;
    const ipAddress = '127.0.0.1';
    
    it('should calculate discount and send reduced amount to VNPay, but record final amount in payments table', async () => {
      // Nền tảng trợ giá 20%
      mockPrisma.promotions.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'SALE20',
        is_active: true,
        start_date: new Date(Date.now() - 10000),
        end_date: new Date(Date.now() + 10000),
        min_order_value: 50000,
        discount_percent: 20,
        usage_limit: 100,
        used_count: 0,
      });

      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: bookingId,
        customer_id: 'cust-1',
      });

      const url = await service.createVNPayUrl(bookingId, amount, ipAddress, 'SALE20');

      // 1. Kiểm tra URL gọi VNPay phải chứa giá đã giảm (80,000 VND -> 8,000,000)
      expect(url).toContain('vnp_Amount=8000000');

      // 2. Kiểm tra DB ghi nhận Payment phải là giá đã giảm (80,000 VND)
      expect(mockPrisma.payments.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amount: 80000, 
          })
        })
      );
    });

    it('should throw BadRequestException if promotion is expired', async () => {
      mockPrisma.promotions.findUnique.mockResolvedValue({
        id: 'promo-1',
        code: 'SALE20',
        is_active: true,
        start_date: new Date(Date.now() - 20000),
        end_date: new Date(Date.now() - 10000), // Hết hạn
      });

      await expect(service.createVNPayUrl(bookingId, amount, ipAddress, 'SALE20')).rejects.toThrow(BadRequestException);
    });
  });
});
