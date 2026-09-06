import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CalculateBookingPriceUseCase } from './calculate-booking-price.use-case';
import { PrismaService } from '../../../../database/prisma.service';

describe('CalculateBookingPriceUseCase', () => {
  let useCase: CalculateBookingPriceUseCase;
  let prisma: any;

  const mockCustomerId = 'cust-uuid-1';
  const mockDto = {
    petId: 'pet-uuid-1',
    serviceId: 'srv-uuid-1',
    addressId: 'addr-uuid-1',
    providerId: 'prov-uuid-1',
    promoCode: 'DISCOUNT20',
  };

  const mockPet = {
    id: 'pet-uuid-1',
    customer_id: mockCustomerId,
    name: 'Milo',
    species: 'Dog',
    weight: 8.5,
    breed: 'Corgi',
  };

  const mockAddress = {
    id: 'addr-uuid-1',
    customer_id: mockCustomerId,
    latitude: 10.7769,
    longitude: 106.7009,
    address_line: '123 Nguyen Hue',
  };

  const mockProvider = {
    id: 'prov-uuid-1',
    user_id: 'user-prov-1',
    status: 'APPROVED',
    base_latitude: 10.7800,
    base_longitude: 106.6900,
    service_radius_km: 10,
    users: { fullName: 'Provider Test' },
  };

  const mockProviderService = {
    id: 'ps-uuid-1',
    provider_id: 'prov-uuid-1',
    service_id: 'srv-uuid-1',
    price: 200000,
    services: {
      id: 'srv-uuid-1',
      name: 'Tắm sấy toàn diện',
      duration_minutes: 60,
    },
  };

  const mockPromotion = {
    id: 'promo-uuid-1',
    code: 'DISCOUNT20',
    discount_percent: 20,
    max_discount_amount: 50000,
    min_order_value: 100000,
    is_active: true,
    start_date: new Date('2020-01-01'),
    end_date: new Date('2099-01-01'),
    usage_limit: 100,
    used_count: 5,
    max_usage_per_user: 2,
  };

  beforeEach(async () => {
    prisma = {
      pets: { findUnique: jest.fn().mockResolvedValue(mockPet) },
      customer_addresses: { findUnique: jest.fn().mockResolvedValue(mockAddress) },
      provider_profiles: { findUnique: jest.fn().mockResolvedValue(mockProvider) },
      provider_services: { findUnique: jest.fn(), findFirst: jest.fn().mockResolvedValue(mockProviderService) },
      promotions: { findUnique: jest.fn().mockResolvedValue(mockPromotion) },
      promotion_usages: { count: jest.fn().mockResolvedValue(0) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateBookingPriceUseCase,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    useCase = module.get<CalculateBookingPriceUseCase>(CalculateBookingPriceUseCase);
  });

  it('should calculate price with distance fee and promotion discount accurately', async () => {
    const result = await useCase.execute(mockCustomerId, mockDto);

    expect(result).toBeDefined();
    expect(result.subtotal).toBe(200000);
    expect(result.item.serviceName).toBe('Tắm sấy toàn diện');
    expect(result.discount.discountAmount).toBe(40000); // 20% of 200,000 = 40,000
    expect(result.discount.promoCode).toBe('DISCOUNT20');
    expect(result.distance.travelFee).toBeGreaterThanOrEqual(0);
    expect(result.totalPrice).toBe(200000 + result.distance.travelFee - 40000);
  });

  it('should throw NotFoundException if pet does not exist', async () => {
    prisma.pets.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(mockCustomerId, mockDto)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if pet does not belong to customer', async () => {
    prisma.pets.findUnique.mockResolvedValue({ ...mockPet, customer_id: 'other-user' });

    await expect(useCase.execute(mockCustomerId, mockDto)).rejects.toThrow(BadRequestException);
  });
});
