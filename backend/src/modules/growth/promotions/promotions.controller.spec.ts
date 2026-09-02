import { Test, TestingModule } from '@nestjs/testing';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';

describe('PromotionsController', () => {
  let controller: PromotionsController;
  let service: PromotionsService;

  const mockPromotionsService = {
    getActivePromotions: jest.fn(),
    validatePromotion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionsController],
      providers: [
        {
          provide: PromotionsService,
          useValue: mockPromotionsService,
        },
      ],
    }).compile();

    controller = module.get<PromotionsController>(PromotionsController);
    service = module.get<PromotionsService>(PromotionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getActivePromotions', () => {
    it('should return a list of active promotions', async () => {
      const result = [{ id: '1', code: 'PROMO10' }];
      mockPromotionsService.getActivePromotions.mockResolvedValue(result);

      expect(await controller.getActivePromotions()).toBe(result);
      expect(mockPromotionsService.getActivePromotions).toHaveBeenCalled();
    });
  });

  describe('validatePromotion', () => {
    it('should validate a promotion and return discount details', async () => {
      const dto: ValidatePromotionDto = { code: 'PROMO10', orderValue: 100000 };
      const userId = 'user-1';
      const result = {
        isValid: true,
        promotionId: '1',
        code: 'PROMO10',
        originalPrice: 100000,
        discountAmount: 10000,
        finalPrice: 90000,
      };

      mockPromotionsService.validatePromotion.mockResolvedValue(result);

      expect(await controller.validatePromotion(userId, dto)).toBe(result);
      expect(mockPromotionsService.validatePromotion).toHaveBeenCalledWith(userId, dto);
    });
  });
});
