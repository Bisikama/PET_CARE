import { Test, TestingModule } from '@nestjs/testing';
import { ProcessDeactivationCron } from './process-deactivation.cron';
import { PrismaService } from '../../../../database/prisma.service';
import { deactivation_status, user_status } from '@prisma/client';

describe('ProcessDeactivationCron', () => {
  let cron: ProcessDeactivationCron;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessDeactivationCron,
        {
          provide: PrismaService,
          useValue: {
            account_deactivation_requests: {
              findMany: jest.fn(),
            },
            $transaction: jest.fn(async (cb) => {
              const tx = {
                account_deactivation_requests: { update: jest.fn() },
                user: { update: jest.fn() },
              };
              await cb(tx);
            }),
          },
        },
      ],
    }).compile();

    cron = module.get<ProcessDeactivationCron>(ProcessDeactivationCron);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(cron).toBeDefined();
  });

  describe('handleCron', () => {
    it('should process pending requests older than 30 days', async () => {
      (prismaService.account_deactivation_requests.findMany as jest.Mock).mockResolvedValue([
        { id: 'req-1', user_id: 'user-1', status: 'PENDING' },
      ]);

      await cron.handleCron();

      expect(prismaService.account_deactivation_requests.findMany).toHaveBeenCalledWith({
        where: {
          status: 'PENDING',
          requested_at: { lte: expect.any(Date) },
        },
      });

      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should do nothing if no pending requests', async () => {
      (prismaService.account_deactivation_requests.findMany as jest.Mock).mockResolvedValue([]);

      await cron.handleCron();

      expect(prismaService.$transaction).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (prismaService.account_deactivation_requests.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(cron.handleCron()).resolves.not.toThrow();
    });
  });
});
