import { Test, TestingModule } from '@nestjs/testing';
import { GetProviderDetailsUseCase } from './get-provider-details.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('GetProviderDetailsUseCase', () => {
  let useCase: GetProviderDetailsUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProviderDetailsUseCase,
        {
          provide: PrismaService,
          useValue: {
            provider_profiles: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<GetProviderDetailsUseCase>(GetProviderDetailsUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return provider details when found', async () => {
    (prisma.provider_profiles.findUnique as jest.Mock).mockResolvedValue({
      id: 'prov-1',
      user_id: 'user-1',
      rating_avg: 4.8,
      total_reviews: 15,
      bio: 'Professional provider',
      base_address_line: 'HCMC',
      users: { fullName: 'Alice', avatarUrl: 'http://example.com/avatar.jpg' },
    });

    const result = await useCase.execute('prov-1');

    expect(prisma.provider_profiles.findUnique).toHaveBeenCalledWith({
      where: { id: 'prov-1' },
      include: {
        users: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
    expect(result.id).toBe('prov-1');
    expect(result.fullName).toBe('Alice');
    expect(result.rating).toBe(4.8);
  });

  it('should throw NotFoundException when provider not found', async () => {
    (prisma.provider_profiles.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute('invalid-id')).rejects.toThrow(NotFoundException);
  });
});
