import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DiscoverProvidersUseCase } from './discover-providers.use-case';
import { SERVICE_DISCOVERY_REPOSITORY } from '../../service-discovery.tokens';

describe('DiscoverProvidersUseCase', () => {
  let useCase: DiscoverProvidersUseCase;
  let repository: jest.Mocked<any>;

  beforeEach(async () => {
    repository = {
      findPetById: jest.fn(),
      findAddressById: jest.fn(),
      findMatchedProviders: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoverProvidersUseCase,
        { provide: SERVICE_DISCOVERY_REPOSITORY, useValue: repository },
      ],
    }).compile();

    useCase = module.get<DiscoverProvidersUseCase>(DiscoverProvidersUseCase);
  });

  it('nên ném lỗi NotFoundException nếu truyền petId không tồn tại', async () => {
    repository.findPetById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        serviceId: 'service-id',
        customerId: 'customer-id',
        petId: 'invalid-pet-id',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('nên ném lỗi NotFoundException nếu truyền addressId không tồn tại', async () => {
    repository.findPetById.mockResolvedValue({ species: 'Dog', weight: 8.5 });
    repository.findAddressById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        serviceId: 'service-id',
        customerId: 'customer-id',
        petId: 'pet-id',
        addressId: 'invalid-address-id',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('nên matching thành công và xếp hạng đúng đối tác theo điểm score tổng', async () => {
    repository.findPetById.mockResolvedValue({ species: 'Dog', weight: 8.5 });
    repository.findAddressById.mockResolvedValue({
      city: 'Hồ Chí Minh',
      district: 'Quận 7',
      ward: 'Tân Kiểng',
    });

    const mockProviders = [
      {
        id: 'provider-1',
        userId: 'user-1',
        fullName: 'Provider Tốt Nhất',
        avatarUrl: null,
        bio: 'Kinh nghiệm nhiều',
        experienceYears: 5,
        ratingAvg: 4.9,
        totalReviews: 20,
        totalCompletedBookings: 15,
        price: 250000,
        durationMinutes: 120,
        kycStatus: 'APPROVED',
        trustBadges: [{ code: 'IDENTITY_VERIFIED', name: 'Đã xác minh' }],
        hasSlotTomorrow: true,
        servesDistrict: true,
      },
      {
        id: 'provider-2',
        userId: 'user-2',
        fullName: 'Provider Bình Thường',
        avatarUrl: null,
        bio: 'Mới làm việc',
        experienceYears: 1,
        ratingAvg: 4.2,
        totalReviews: 2,
        totalCompletedBookings: 2,
        price: 300000,
        durationMinutes: 120,
        kycStatus: 'APPROVED',
        trustBadges: [],
        hasSlotTomorrow: false,
        servesDistrict: true,
      },
    ];

    repository.findMatchedProviders.mockResolvedValue(mockProviders);

    const result = await useCase.execute({
      serviceId: 'service-id',
      customerId: 'customer-id',
      petId: 'pet-id',
      addressId: 'address-id',
    });

    expect(result).toHaveLength(2);
    // Điểm số của provider-1 phải cao hơn provider-2 và đứng trước
    expect(result[0].id).toBe('provider-1');
    expect(result[0].score).toBeGreaterThan(result[1].score);

    // Kiểm tra các lý do đề xuất (recommendation reasons)
    expect(result[0].recommendationReasons).toContain('Phù hợp chó 8.5kg');
    expect(result[0].recommendationReasons).toContain('Đã xác minh danh tính');
    expect(result[0].recommendationReasons).toContain('Có slot ngày mai');
    expect(result[0].recommendationReasons).toContain('Rating cao 4.9');
    expect(result[0].recommendationReasons).toContain('Phục vụ tại Quận 7');
  });
});
