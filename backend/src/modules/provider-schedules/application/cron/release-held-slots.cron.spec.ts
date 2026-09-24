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
            bookings: {
              findMany: jest.fn().mockResolvedValue([]),
              update: jest.fn(),
            },
            payments: {
              update: jest.fn(),
            },
            booking_status_logs: {
              create: jest.fn(),
            },
            booking_events: {
              create: jest.fn(),
            },
            provider_working_slots: {
              updateMany: jest.fn(),
            },
            $transaction: jest.fn((callback) => callback(prismaService)),
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
    it('should release held slots successfully when no expired bookings exist', async () => {
      (prismaService.bookings.findMany as jest.Mock).mockResolvedValue([]);
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
          reserved_until: null,
          updated_at: expect.any(Date),
        },
      });
    });

    it('should expire pending bookings and release corresponding slots', async () => {
      const mockExpiredBooking = {
        id: 'booking-1',
        provider_working_slot_id: 'slot-1',
        payments: { id: 'payment-1', status: 'PENDING' },
      };

      (prismaService.bookings.findMany as jest.Mock).mockResolvedValue([mockExpiredBooking]);
      (prismaService.provider_working_slots.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      await cron.handleCron();

      expect(prismaService.bookings.update).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        data: {
          status: 'EXPIRED',
          updated_at: expect.any(Date),
        },
      });

      expect(prismaService.payments.update).toHaveBeenCalledWith({
        where: { id: 'payment-1' },
        data: {
          status: 'VOIDED',
        },
      });

      expect(prismaService.booking_status_logs.create).toHaveBeenCalled();
      expect(prismaService.booking_events.create).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (prismaService.bookings.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(cron.handleCron()).resolves.not.toThrow();
    });
  });
});
