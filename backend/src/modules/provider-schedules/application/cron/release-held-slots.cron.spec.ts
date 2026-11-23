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
              updateMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            payments: {
              updateMany: jest.fn(),
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

    it('uses the slot held_until as the primary deadline (so bank-transfer extensions are respected)', async () => {
      await cron.handleCron();

      const where = (prismaService.bookings.findMany as jest.Mock).mock.calls[0][0].where;
      expect(where.status).toBe('PENDING_PAYMENT');
      expect(where.OR).toEqual([
        { provider_working_slots: { is: { held_until: { lt: expect.any(Date) } } } },
        { provider_working_slots: { is: { held_until: null } }, created_at: { lt: expect.any(Date) } },
        { provider_working_slot_id: null, created_at: { lt: expect.any(Date) } },
      ]);
      // Không còn điều kiện created_at đứng riêng — nó từng huỷ đơn chuyển khoản sau 10 phút dù đã gia hạn
      expect(where.OR).not.toContainEqual({ created_at: { lt: expect.any(Date) } });
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

      expect(prismaService.bookings.updateMany).toHaveBeenCalledWith({
        where: { id: 'booking-1', status: 'PENDING_PAYMENT' },
        data: {
          status: 'EXPIRED',
          updated_at: expect.any(Date),
        },
      });

      expect(prismaService.payments.updateMany).toHaveBeenCalledWith({
        where: { id: 'payment-1', status: 'PENDING' },
        data: {
          status: 'VOIDED',
        },
      });

      expect(prismaService.booking_status_logs.create).toHaveBeenCalled();
      expect(prismaService.booking_events.create).toHaveBeenCalled();
    });

    it('does not expire a booking that was paid between the scan and the update', async () => {
      (prismaService.bookings.findMany as jest.Mock).mockResolvedValue([
        { id: 'booking-1', provider_working_slot_id: 'slot-1', payments: { id: 'payment-1', status: 'PENDING' } },
      ]);
      // Webhook vừa chuyển booking sang PENDING_PROVIDER_ACCEPTANCE => updateMany khớp 0 dòng
      (prismaService.bookings.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prismaService.provider_working_slots.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      await cron.handleCron();

      expect(prismaService.payments.updateMany).not.toHaveBeenCalled();
      expect(prismaService.booking_status_logs.create).not.toHaveBeenCalled();
      expect(prismaService.booking_events.create).not.toHaveBeenCalled();
      // Chỉ còn lượt dọn slot chung (bước 2), không giải phóng slot của booking này
      expect(prismaService.provider_working_slots.updateMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      (prismaService.bookings.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(cron.handleCron()).resolves.not.toThrow();
    });
  });
});
