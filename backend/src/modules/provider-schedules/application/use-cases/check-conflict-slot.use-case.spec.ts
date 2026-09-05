import { Test, TestingModule } from '@nestjs/testing';
import { CheckConflictSlotUseCase } from './check-conflict-slot.use-case';
import { PrismaService } from '../../../../database/prisma.service';

describe('CheckConflictSlotUseCase', () => {
  let useCase: CheckConflictSlotUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckConflictSlotUseCase,
        {
          provide: PrismaService,
          useValue: {
            bookings: {
              findMany: jest.fn(),
            },
            provider_working_slots: {
              findMany: jest.fn(),
            }
          },
        },
      ],
    }).compile();

    useCase = module.get<CheckConflictSlotUseCase>(CheckConflictSlotUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return no conflict when slot is available (Happy Path)', async () => {
    const dto = {
      providerId: 'provider-1',
      startTime: '2026-09-04T10:00:00Z',
      endTime: '2026-09-04T11:00:00Z'
    };

    (prismaService.bookings.findMany as jest.Mock).mockResolvedValue([]);
    (prismaService.provider_working_slots.findMany as jest.Mock).mockResolvedValue([]);

    const result = await useCase.execute(dto);

    expect(result).toEqual({ isConflict: false, message: 'Slot is available' });
  });

  it('should return conflict if there are overlapping bookings (Negative Case)', async () => {
    const dto = {
      providerId: 'provider-1',
      startTime: '2026-09-04T10:00:00Z',
      endTime: '2026-09-04T11:00:00Z'
    };

    const mockBooking = {
      id: 'booking-1',
      start_time: new Date('2026-09-04T09:30:00Z'),
      end_time: new Date('2026-09-04T10:30:00Z')
    };

    (prismaService.bookings.findMany as jest.Mock).mockResolvedValue([mockBooking]);
    (prismaService.provider_working_slots.findMany as jest.Mock).mockResolvedValue([]);

    const result = await useCase.execute(dto);

    expect(result.isConflict).toBe(true);
    expect(result.reason).toBe('Overlapping bookings found');
    expect(result.conflicts).toBeDefined();
    expect((result.conflicts as any)[0].bookingId).toBe('booking-1');
  });

  it('should return conflict if slots are blocked (Negative Case)', async () => {
    const dto = {
      providerId: 'provider-1',
      startTime: '2026-09-04T10:00:00Z',
      endTime: '2026-09-04T11:00:00Z'
    };

    const mockSlot = {
      id: 'slot-1',
      start_time: new Date('2026-09-04T10:30:00Z'),
      end_time: new Date('2026-09-04T11:30:00Z'),
      status: 'BLOCKED'
    };

    (prismaService.bookings.findMany as jest.Mock).mockResolvedValue([]);
    (prismaService.provider_working_slots.findMany as jest.Mock).mockResolvedValue([mockSlot]);

    const result = await useCase.execute(dto);

    expect(result.isConflict).toBe(true);
    expect(result.reason).toBe('Slots are blocked or already booked');
    expect(result.conflicts).toBeDefined();
    expect((result.conflicts as any)[0].slotId).toBe('slot-1');
  });
});
