import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../database/prisma.service';
import { WalletsService } from '../../../wallets/application/use-cases/wallets.service';
import { SubscriptionsService } from '../../../growth/subscriptions/subscriptions.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';
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
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    bookings: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    wallets: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrisma)),
  };

  const mockWalletsService = {
    processTransaction: jest.fn(),
  };

  const mockSubscriptionsService = {
    handleSubscriptionSuccess: jest.fn(),
  };

  const mockNotificationsService = {
    sendNotification: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn().mockReturnValue('mock-value'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: WalletsService, useValue: mockWalletsService },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
        { provide: NotificationsService, useValue: mockNotificationsService },
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

  describe('processPaymentCallback', () => {
    const mockVnpPayload = {
      vnp_TxnRef: 'booking-123',
      vnp_ResponseCode: '00',
      vnp_TransactionNo: '123456',
      vnp_OrderInfo: 'Thanh toan booking booking-123',
      vnp_SecureHash: 'valid_hash'
    };

    it('should process subscription payment if orderInfo starts with SUB_', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'VNP_HASH_SECRET') return 'secret';
        return 'mock';
      });

      // generate signature
      const crypto = require('crypto');
      const qs = require('qs');
      const payload = { ...mockVnpPayload, vnp_OrderInfo: 'SUB_user1_PREMIUM' };
      delete payload.vnp_SecureHash;
      const sorted = (service as any).sortObject(payload);
      const signData = qs.stringify(sorted, { encode: false });
      const validHash = crypto.createHmac('sha512', 'secret').update(Buffer.from(signData, 'utf-8')).digest('hex');
      
      const result = await service.processPaymentCallback({ ...payload, vnp_SecureHash: validHash });
      
      expect(result.RspCode).toBe('00');
      expect(mockSubscriptionsService.handleSubscriptionSuccess).toHaveBeenCalledWith('user1', 'PREMIUM');
    });

    it('should process booking payment successfully and send notification', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'VNP_HASH_SECRET') return 'secret';
        return 'mock';
      });

      const crypto = require('crypto');
      const qs = require('qs');
      const payload = { ...mockVnpPayload };
      delete payload.vnp_SecureHash;
      const sorted = (service as any).sortObject(payload);
      const signData = qs.stringify(sorted, { encode: false });
      const validHash = crypto.createHmac('sha512', 'secret').update(Buffer.from(signData, 'utf-8')).digest('hex');
      
      mockPrisma.payments.findFirst.mockResolvedValue({
        id: 'payment-1',
        transaction_code: 'booking-123',
        status: 'PENDING',
        booking_id: 'booking-123',
        customer_id: 'cust-1',
        amount: 100000,
        idempotency_key: null,
        bookings: {
          provider_id: 'provider-1',
          total_price: 100000,
        },
      });

      mockPrisma.wallets.findUnique.mockResolvedValue({
        id: 'wallet-1',
        user_id: 'provider-1',
      });

      mockPrisma.bookings.findUnique.mockResolvedValue({
        id: 'booking-123',
        provider_profiles: { user_id: 'provider-1' }
      });

      const result = await service.processPaymentCallback({ ...payload, vnp_SecureHash: validHash });

      expect(result.RspCode).toBe('00');
      expect(mockPrisma.payments.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'PAID_HELD_IN_ESCROW'
          })
        })
      );
      expect(mockNotificationsService.sendNotification).toHaveBeenCalled();
    });
  });

  describe('processMomoIPN', () => {
    const mockMomoPayload = {
      partnerCode: 'MOMO',
      orderId: 'booking-123',
      requestId: 'req-123',
      amount: 100000,
      orderInfo: 'Thanh toan booking',
      orderType: 'momo_wallet',
      transId: 123456789,
      resultCode: 0,
      message: 'Success',
      payType: 'qr',
      responseTime: 1616161616,
      extraData: '',
      signature: '', // will be set dynamically
    };

    it('should return 97 if signature is invalid', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'MOMO_ACCESS_KEY') return 'valid_access_key';
        if (key === 'MOMO_SECRET_KEY') return 'valid_secret_key';
        return 'mock-value';
      });

      const payload = { ...mockMomoPayload, signature: 'invalid_signature' };
      const result = await service.processMomoIPN(payload);

      expect(result.RspCode).toBe('97');
      expect(result.Message).toBe('Checksum failed');
    });

    it('should process payment successfully and hold funds in escrow', async () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'MOMO_ACCESS_KEY') return 'valid_access_key';
        if (key === 'MOMO_SECRET_KEY') return 'valid_secret_key';
        return 'mock-value';
      });

      // Generate valid signature
      const rawSignature = `accessKey=valid_access_key&amount=${mockMomoPayload.amount}&extraData=${mockMomoPayload.extraData}&message=${mockMomoPayload.message}&orderId=${mockMomoPayload.orderId}&orderInfo=${mockMomoPayload.orderInfo}&orderType=${mockMomoPayload.orderType}&partnerCode=${mockMomoPayload.partnerCode}&payType=${mockMomoPayload.payType}&requestId=${mockMomoPayload.requestId}&responseTime=${mockMomoPayload.responseTime}&resultCode=${mockMomoPayload.resultCode}&transId=${mockMomoPayload.transId}`;
      const crypto = require('crypto');
      const validSignature = crypto.createHmac('sha256', 'valid_secret_key').update(Buffer.from(rawSignature, 'utf-8')).digest('hex');

      const payload = { ...mockMomoPayload, signature: validSignature };

      mockPrisma.payments.findFirst.mockResolvedValue({
        id: 'payment-1',
        transaction_code: 'booking-123',
        status: 'PENDING',
        booking_id: 'booking-123',
        idempotency_key: null,
        bookings: {
          provider_id: 'provider-1',
          total_price: 100000,
        },
      });

      mockPrisma.wallets.findUnique.mockResolvedValue({
        id: 'wallet-1',
        user_id: 'provider-1',
      });

      const result = await service.processMomoIPN(payload);

      expect(result.RspCode).toBe('00');
      expect(mockPrisma.payments.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'payment-1' },
          data: expect.objectContaining({
            status: 'PAID_HELD_IN_ESCROW',
            idempotency_key: '123456789',
          })
        })
      );
      expect(mockWalletsService.processTransaction).toHaveBeenCalledWith(
        'wallet-1',
        100000,
        'ESCROW_HOLD',
        'booking-123',
        'Ký quỹ thanh toán từ Momo',
        mockPrisma
      );
    });
  });
});
