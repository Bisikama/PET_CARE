import { Test, TestingModule } from '@nestjs/testing';
import { ManageBankAccountsUseCase } from './manage-bank-accounts.use-case';
import { PrismaService } from '../../../database/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ManageBankAccountsUseCase', () => {
  let useCase: ManageBankAccountsUseCase;
  let prismaService: PrismaService;

  const mockPrismaService = {
    provider_profiles: {
      findUnique: jest.fn(),
    },
    provider_bank_accounts: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManageBankAccountsUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<ManageBankAccountsUseCase>(ManageBankAccountsUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user-123';
    const providerId = 'provider-456';
    const dto = {
      bank_name: 'Techcombank',
      account_number: '123456789',
      account_name: 'NGUYEN VAN A',
      branch: 'HN',
      is_default: false,
    };

    it('should throw ForbiddenException if user is not a provider', async () => {
      mockPrismaService.provider_profiles.findUnique.mockResolvedValue(null);

      await expect(useCase.create(userId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should set is_default = true if it is the first account', async () => {
      mockPrismaService.provider_profiles.findUnique.mockResolvedValue({ id: providerId, user_id: userId });
      mockPrismaService.provider_bank_accounts.count.mockResolvedValue(0);
      mockPrismaService.provider_bank_accounts.create.mockResolvedValue({ id: 'account-1', ...dto, is_default: true });

      const result = await useCase.create(userId, dto);

      expect(mockPrismaService.provider_bank_accounts.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          is_default: true,
        }),
      });
      expect(result.is_default).toBe(true);
    });

    it('should unset other defaults if new account is set as default', async () => {
      mockPrismaService.provider_profiles.findUnique.mockResolvedValue({ id: providerId, user_id: userId });
      mockPrismaService.provider_bank_accounts.count.mockResolvedValue(1); // Not first account
      mockPrismaService.provider_bank_accounts.create.mockResolvedValue({ id: 'account-2', ...dto, is_default: true });

      const dtoWithDefault = { ...dto, is_default: true };
      await useCase.create(userId, dtoWithDefault);

      expect(mockPrismaService.provider_bank_accounts.updateMany).toHaveBeenCalledWith({
        where: { provider_id: providerId, is_default: true },
        data: { is_default: false },
      });
      expect(mockPrismaService.provider_bank_accounts.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          is_default: true,
        }),
      });
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const providerId = 'provider-456';
    const accountId = 'account-123';

    it('should unset other defaults if updated account is set as default', async () => {
      mockPrismaService.provider_profiles.findUnique.mockResolvedValue({ id: providerId, user_id: userId });
      mockPrismaService.provider_bank_accounts.findUnique.mockResolvedValue({ id: accountId, provider_id: providerId, is_default: false });
      
      const updateDto = { is_default: true };
      await useCase.update(userId, accountId, updateDto);

      expect(mockPrismaService.provider_bank_accounts.updateMany).toHaveBeenCalledWith({
        where: { provider_id: providerId, is_default: true, id: { not: accountId } },
        data: { is_default: false },
      });
      expect(mockPrismaService.provider_bank_accounts.update).toHaveBeenCalledWith({
        where: { id: accountId },
        data: expect.objectContaining({ is_default: true }),
      });
    });
  });
});
