import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetProviderScheduleUseCase } from './get-provider-schedule.use-case';
import { PROVIDER_SCHEDULES_REPOSITORY } from '../../provider-schedules.tokens';
import { ProviderSchedulesRepositoryPort } from '../ports/provider-schedules.repository.port';

describe('GetProviderScheduleUseCase', () => {
  let useCase: GetProviderScheduleUseCase;
  let mockRepo: Partial<jest.Mocked<ProviderSchedulesRepositoryPort>>;

  const mockTimeSlots = [
    {
      id: 'slot-1',
      name: 'Slot 1 (07:00 - 08:30)',
      start_time: '07:00',
      end_time: '08:30',
      slot_order: 1,
      created_at: new Date(),
    },
    {
      id: 'slot-2',
      name: 'Slot 2 (08:30 - 10:00)',
      start_time: '08:30',
      end_time: '10:00',
      slot_order: 2,
      created_at: new Date(),
    },
  ];

  beforeEach(async () => {
    mockRepo = {
      findProviderProfileByUserId: jest.fn(),
      findAllTimeSlots: jest.fn(),
      findWorkingDaysWithSlots: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProviderScheduleUseCase,
        {
          provide: PROVIDER_SCHEDULES_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetProviderScheduleUseCase>(GetProviderScheduleUseCase);
  });

  it('should throw NotFoundException if provider profile not found', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue(null);

    await expect(
      useCase.execute('user-1', '2026-09-01', '2026-09-07'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if startDate > endDate', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue({ id: 'provider-1' });

    await expect(
      useCase.execute('user-1', '2026-09-10', '2026-09-01'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if range > 31 days', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue({ id: 'provider-1' });

    await expect(
      useCase.execute('user-1', '2026-09-01', '2026-10-15'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return complete matrix of days with slot views', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue({ id: 'provider-1' });
    mockRepo.findAllTimeSlots!.mockResolvedValue(mockTimeSlots);

    const mockWorkingDays = [
      {
        id: 'wd-1',
        work_date: new Date('2026-09-01T00:00:00.000Z'),
        working_mode: 'FULL_TIME',
        provider_working_slots: [
          {
            id: 'pws-1',
            slot_id: 'slot-1',
            status: 'AVAILABLE',
            held_until: null,
            reserved_until: null,
            bookings: [],
          },
        ],
      },
    ];

    mockRepo.findWorkingDaysWithSlots!.mockResolvedValue(mockWorkingDays);

    const result = await useCase.execute('user-1', '2026-09-01', '2026-09-02');

    expect(result).toHaveLength(2); // 2026-09-01 and 2026-09-02
    expect(result[0].workDate).toBe('2026-09-01');
    expect(result[0].slots).toHaveLength(2);
    expect(result[0].slots[0].status).toBe('AVAILABLE');
    expect(result[0].slots[1].status).toBe('BLOCKED'); // slot-2 not in DB -> defaults to BLOCKED

    expect(result[1].workDate).toBe('2026-09-02');
    expect(result[1].slots[0].status).toBe('BLOCKED'); // day 2 not in DB -> defaults to BLOCKED
  });
});
