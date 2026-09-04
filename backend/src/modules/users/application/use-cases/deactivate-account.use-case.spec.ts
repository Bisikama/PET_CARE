import { Test, TestingModule } from '@nestjs/testing';
import { DeactivateAccountUseCase } from './deactivate-account.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DeactivateAccountUseCase', () => {
  let useCase: DeactivateAccountUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateAccountUseCase,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            account_deactivation_requests: {
              findFirst: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<DeactivateAccountUseCase>(DeactivateAccountUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a pending request for a valid user (Happy Path)', async () => {
    const userId = 'valid-user-id';
    const dto = { reason: 'I no longer need this service' };

    (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
    (prismaService.account_deactivation_requests.findFirst as jest.Mock).mockResolvedValue(null);
    (prismaService.account_deactivation_requests.create as jest.Mock).mockResolvedValue({ id: 'request-1' });

    const result = await useCase.execute(userId, dto);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
    expect(prismaService.account_deactivation_requests.findFirst).toHaveBeenCalledWith({
      where: { user_id: userId, status: 'PENDING' },
    });
    expect(prismaService.account_deactivation_requests.create).toHaveBeenCalledWith({
      data: { user_id: userId, reason: dto.reason },
    });
    expect(result).toEqual({
      message: 'Your account deactivation request has been submitted and is pending review.',
      requestId: 'request-1',
    });
  });

  it('should throw ConflictException if a request is already pending (Negative Case)', async () => {
    const userId = 'valid-user-id';
    const dto = { reason: 'I no longer need this service' };

    (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
    (prismaService.account_deactivation_requests.findFirst as jest.Mock).mockResolvedValue({ id: 'request-1' });

    await expect(useCase.execute(userId, dto)).rejects.toThrow(ConflictException);
    await expect(useCase.execute(userId, dto)).rejects.toThrow('Request is already pending');

    expect(prismaService.account_deactivation_requests.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if user is not found', async () => {
    const userId = 'invalid-user-id';
    const dto = { reason: 'I no longer need this service' };

    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(useCase.execute(userId, dto)).rejects.toThrow(NotFoundException);
  });
});
