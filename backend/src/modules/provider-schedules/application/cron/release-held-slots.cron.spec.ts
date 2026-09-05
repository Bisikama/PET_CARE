import { Test, TestingModule } from '@nestjs/testing';
import { ReleaseHeldSlotsCron } from './release-held-slots.cron';
import { PrismaService } from '../../../../database/prisma.service';

describe('ReleaseHeldSlotsCron', () => {
  let cron: ReleaseHeldSlotsCron;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleaseHeldSlotsCron,
        {
          provide: PrismaService,
          useValue: {
            provider_working_slots: {
              updateMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    cron = module.get<ReleaseHeldSlotsCron>(ReleaseHeldSlotsCron);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(cron).toBeDefined();
  });

  describe('handleCron', () => {
    it('should release held slots successfully', async () => {
      (prismaService.provider_working_slots.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      await cron.handleCron();

      expect(prismaService.provider_working_slots.updateMany).toHaveBeenCalledWith({
        where: {
          status: 'HELD_FOR_PAYMENT',
          held_until: { lt: expect.any(Date) },
        },
        data: {
          status: 'AVAILABLE',
          held_until: null,
        },
      });
    });

    it('should handle errors gracefully', async () => {
      (prismaService.provider_working_slots.updateMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(cron.handleCron()).resolves.not.toThrow();
    });
  });
});
