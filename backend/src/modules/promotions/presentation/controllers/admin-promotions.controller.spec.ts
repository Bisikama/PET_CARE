import { Test, TestingModule } from '@nestjs/testing';
import { AdminPromotionsController } from './admin-promotions.controller';
import { PromotionsService } from '../../../growth/promotions/promotions.service';

describe('AdminPromotionsController', () => {
  let controller: AdminPromotionsController;
  let service: PromotionsService;

  const mockPromotionsService = {
    getAllPromotionsAdmin: jest.fn(),
    createPromotion: jest.fn(),
    updatePromotionLimits: jest.fn(),
    updatePromotion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminPromotionsController],
      providers: [
        {
          provide: PromotionsService,
          useValue: mockPromotionsService,
        },
      ],
    }).compile();

    controller = module.get<AdminPromotionsController>(AdminPromotionsController);
    service = module.get<PromotionsService>(PromotionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPromotions', () => {
    it('should return all promotions', async () => {
      const mockData = [{ id: '1', code: 'TEST1' }];
      mockPromotionsService.getAllPromotionsAdmin.mockResolvedValue(mockData);

      const result = await controller.getAllPromotions();

      expect(service.getAllPromotionsAdmin).toHaveBeenCalled();
      expect(result).toEqual({ success: true, data: mockData });
    });
  });

  describe('updatePromotion', () => {
    it('should update promotion end_date and is_active', async () => {
      const id = '1';
      const dto = { end_date: '2026-12-31T23:59:59Z', is_active: false };
      const updatedPromo = { id, ...dto, end_date: new Date(dto.end_date) };
      
      mockPromotionsService.updatePromotion.mockResolvedValue(updatedPromo);

      const result = await controller.updatePromotion(id, dto);

      expect(service.updatePromotion).toHaveBeenCalledWith(id, {
        end_date: expect.any(Date),
        is_active: false,
      });
      expect(result).toEqual({ success: true, promotion: updatedPromo });
    });

    it('should update promotion is_active only', async () => {
      const id = '1';
      const dto = { is_active: true };
      const updatedPromo = { id, is_active: true };
      
      mockPromotionsService.updatePromotion.mockResolvedValue(updatedPromo);

      const result = await controller.updatePromotion(id, dto);

      expect(service.updatePromotion).toHaveBeenCalledWith(id, {
        is_active: true,
      });
      expect(result).toEqual({ success: true, promotion: updatedPromo });
    });
  });
});
