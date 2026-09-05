import { Test, TestingModule } from '@nestjs/testing';
import { DiscoverProvidersUseCase } from './discover-providers.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { provider_status } from '@prisma/client';

describe('DiscoverProvidersUseCase', () => {
  let useCase: DiscoverProvidersUseCase;
  let prismaService: PrismaService;

  const mockPrisma = {
    provider_profiles: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscoverProvidersUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<DiscoverProvidersUseCase>(DiscoverProvidersUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('TEST CASE 1: Xếp hạng thuật toán Normalize đúng đắn (C > B > A)', async () => {
    // Provider A: Rating 5.0, Trust Score 100, Bookings 2 (Người mới xuất sắc)
    // Provider B: Rating 4.0, Trust Score 80, Bookings 500 (Người cũ bình thường)
    // Provider C: Rating 4.8, Trust Score 90, Bookings 100 (Người phong độ ổn định)
    
    // Theo thuật toán (max = 500 bookings):
    // C: 0.96*0.4 + 0.9*0.3 + (log10(101)/log10(501))*0.3 ≈ 0.384 + 0.27 + 0.222 = 0.876 (88 điểm)
    // B: 0.8*0.4 + 0.8*0.3 + 1*0.3 = 0.32 + 0.24 + 0.3 = 0.86 (86 điểm)
    // A: 1*0.4 + 1*0.3 + (log10(3)/log10(501))*0.3 ≈ 0.4 + 0.3 + 0.053 = 0.753 (75 điểm)

    mockPrisma.provider_profiles.findMany.mockResolvedValueOnce([
      {
        id: 'provider-a',
        user_id: 'user-a',
        status: provider_status.APPROVED,
        rating_avg: 5.0,
        trust_score: 100,
        total_completed_bookings: 2, 
        provider_services: [{ price: 200000 }],
        provider_trust_badges: [],
      },
      {
        id: 'provider-b',
        user_id: 'user-b',
        status: provider_status.APPROVED,
        rating_avg: 4.0,
        trust_score: 80,
        total_completed_bookings: 500,
        provider_services: [{ price: 150000 }],
        provider_trust_badges: [],
      },
      {
        id: 'provider-c',
        user_id: 'user-c',
        status: provider_status.APPROVED,
        rating_avg: 4.8,
        trust_score: 90,
        total_completed_bookings: 100,
        provider_services: [{ price: 250000 }],
        provider_trust_badges: [],
      }
    ]);

    const result = await useCase.execute({ serviceId: 'service-id' });

    expect(result).toHaveLength(3);
    
    const scoreC = result.find(p => p.id === 'provider-c')?.score || 0;
    const scoreB = result.find(p => p.id === 'provider-b')?.score || 0;
    const scoreA = result.find(p => p.id === 'provider-a')?.score || 0;
    
    expect(scoreC).toBeGreaterThan(scoreB);
    expect(scoreB).toBeGreaterThan(scoreA);

    // Kiểm tra Index sau khi Sort (C > B > A)
    expect(result[0].id).toBe('provider-c');
    expect(result[1].id).toBe('provider-b');
    expect(result[2].id).toBe('provider-a');
  });

  it('TEST CASE 2: Gọi DB lấy đúng Provider đang APPROVED', async () => {
    mockPrisma.provider_profiles.findMany.mockResolvedValueOnce([]);

    await useCase.execute({ serviceId: 'service-1', city: 'Hà Nội' });

    expect(mockPrisma.provider_profiles.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'APPROVED',
          provider_services: expect.objectContaining({
            some: { service_id: 'service-1' }
          }),
          provider_service_areas: expect.objectContaining({
            some: { city: 'Hà Nội' }
          })
        })
      })
    );
  });
});
