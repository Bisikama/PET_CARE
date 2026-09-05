import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './application/use-cases/payments.service';
import { ConfigService } from '@nestjs/config';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let mockPaymentsService: Partial<PaymentsService>;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    mockPaymentsService = {
      createMomoUrl: jest.fn().mockResolvedValue('https://momo.vn/pay'),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key, defaultValue) => {
        if (key === 'FRONTEND_URL') return 'http://localhost:5000';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: mockPaymentsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  describe('vnpayReturn', () => {
    it('should redirect to frontend with success status if vnp_ResponseCode is 00', async () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;
      const query = { vnp_ResponseCode: '00', vnp_TxnRef: 'BOOKING_123' };

      await controller.vnpayReturn(query, mockRes);

      expect(mockConfigService.get).toHaveBeenCalledWith('FRONTEND_URL', expect.any(String));
      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:5000/payment/result?status=success&orderId=BOOKING_123&method=VNPAY'
      );
    });

    it('should redirect to frontend with failed status if vnp_ResponseCode is not 00', async () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;
      const query = { vnp_ResponseCode: '24', vnp_TxnRef: 'BOOKING_456' };

      await controller.vnpayReturn(query, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:5000/payment/result?status=failed&orderId=BOOKING_456&method=VNPAY'
      );
    });
  });

  describe('momoReturn', () => {
    it('should redirect to frontend with success status if resultCode is 0', async () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;
      const query = { resultCode: '0', orderId: 'BOOKING_789' };

      await controller.momoReturn(query, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:5000/payment/result?status=success&orderId=BOOKING_789&method=MOMO'
      );
    });

    it('should redirect to frontend with failed status if resultCode is not 0', async () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;
      const query = { resultCode: '1006', orderId: 'BOOKING_999' };

      await controller.momoReturn(query, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        'http://localhost:5000/payment/result?status=failed&orderId=BOOKING_999&method=MOMO'
      );
    });
  });
});
