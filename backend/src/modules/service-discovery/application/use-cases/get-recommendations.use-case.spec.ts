import { Test, TestingModule } from '@nestjs/testing';
import { GetRecommendationsUseCase } from './get-recommendations.use-case';
import { PrismaService } from '../../../../database/prisma.service';

describe('GetRecommendationsUseCase', () => {
  let useCase: GetRecommendationsUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRecommendationsUseCase,
        {
          provide: PrismaService,
          useValue: {
            provider_profiles: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<GetRecommendationsUseCase>(GetRecommendationsUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return recommended providers', async () => {
    (prisma.provider_profiles.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'prov-1',
        user_id: 'user-1',
        rating_avg: 5,
        total_reviews: 10,
        bio: 'Good provider',
        base_address_line: 'Hanoi',
        users: { fullName: 'John', avatarUrl: 'http://img.com' },
      },
    ]);

    const result = await useCase.execute();

    expect(prisma.provider_profiles.findMany).toHaveBeenCalled();
    expect(result.length).toBe(1);
    expect(result[0].fullName).toBe('John');
    expect(result[0].rating).toBe(5);
  });
});
