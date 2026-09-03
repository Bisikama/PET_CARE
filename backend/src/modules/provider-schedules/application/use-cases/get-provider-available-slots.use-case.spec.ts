import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetProviderAvailableSlotsUseCase } from './get-provider-available-slots.use-case';
import { PROVIDER_SCHEDULES_REPOSITORY } from '../../provider-schedules.tokens';
import { ProviderSchedulesRepositoryPort } from '../ports/provider-schedules.repository.port';

describe('GetProviderAvailableSlotsUseCase', () => {
  let useCase: GetProviderAvailableSlotsUseCase;
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
      findProviderProfileById: jest.fn(),
      findAllTimeSlots: jest.fn(),
      findWorkingDaysWithSlots: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProviderAvailableSlotsUseCase,
        {
          provide: PROVIDER_SCHEDULES_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetProviderAvailableSlotsUseCase>(GetProviderAvailableSlotsUseCase);
  });

  it('should throw NotFoundException if provider profile not found', async () => {
    mockRepo.findProviderProfileById!.mockResolvedValue(null);

    await expect(
      useCase.execute('provider-1', '2026-09-01', '2026-09-07'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if startDate > endDate', async () => {
    mockRepo.findProviderProfileById!.mockResolvedValue({ id: 'provider-1' });

    await expect(
      useCase.execute('provider-1', '2026-09-10', '2026-09-01'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if range > 31 days', async () => {
    mockRepo.findProviderProfileById!.mockResolvedValue({ id: 'provider-1' });

    await expect(
      useCase.execute('provider-1', '2026-09-01', '2026-10-15'),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return 7 days by default when no dates provided', async () => {
    mockRepo.findProviderProfileById!.mockResolvedValue({ id: 'provider-1' });
    mockRepo.findAllTimeSlots!.mockResolvedValue(mockTimeSlots);
    mockRepo.findWorkingDaysWithSlots!.mockResolvedValue([]);

    const result = await useCase.execute('provider-1');

    expect(result).toHaveLength(7);
    expect(result[0].slots).toHaveLength(2);
    expect(result[0].slots[0].isAvailable).toBe(false);
  });

  it('should return available slots and providerWorkingSlotId accurately', async () => {
    mockRepo.findProviderProfileById!.mockResolvedValue({ id: 'provider-1' });
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
          },
          {
            id: 'pws-2',
            slot_id: 'slot-2',
            status: 'BOOKED',
          },
        ],
      },
    ];

    mockRepo.findWorkingDaysWithSlots!.mockResolvedValue(mockWorkingDays);

    const result = await useCase.execute('provider-1', '2026-09-01', '2026-09-01');

    expect(result).toHaveLength(1);
    expect(result[0].workDate).toBe('2026-09-01');
    expect(result[0].slots[0].providerWorkingSlotId).toBe('pws-1');
    expect(result[0].slots[0].status).toBe('AVAILABLE');
    expect(result[0].slots[0].isAvailable).toBe(true);

    expect(result[0].slots[1].providerWorkingSlotId).toBe('pws-2');
    expect(result[0].slots[1].status).toBe('BOOKED');
    expect(result[0].slots[1].isAvailable).toBe(false);
  });
});
