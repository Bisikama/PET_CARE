import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProviderScheduleUseCase } from './update-provider-schedule.use-case';
import { PROVIDER_SCHEDULES_REPOSITORY } from '../../provider-schedules.tokens';
import { ProviderSchedulesRepositoryPort } from '../ports/provider-schedules.repository.port';

describe('UpdateProviderScheduleUseCase', () => {
  let useCase: UpdateProviderScheduleUseCase;
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
      upsertDaySchedule: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProviderScheduleUseCase,
        {
          provide: PROVIDER_SCHEDULES_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProviderScheduleUseCase>(
      UpdateProviderScheduleUseCase,
    );
  });

  it('should throw NotFoundException if provider profile not found', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        schedules: [{ workDate: '2026-09-10', slotIds: ['slot-1'] }],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if schedules array is empty', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue({ id: 'provider-1' });

    await expect(
      useCase.execute({
        userId: 'user-1',
        schedules: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if workDate is in the past', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue({ id: 'provider-1' });

    await expect(
      useCase.execute({
        userId: 'user-1',
        schedules: [{ workDate: '2020-01-01', slotIds: ['slot-1'] }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if invalid slotId is provided', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue({ id: 'provider-1' });
    mockRepo.findAllTimeSlots!.mockResolvedValue(mockTimeSlots);

    // Date tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await expect(
      useCase.execute({
        userId: 'user-1',
        schedules: [{ workDate: dateStr, slotIds: ['non-existent-slot'] }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should update schedules successfully for multiple days', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue({ id: 'provider-1' });
    mockRepo.findAllTimeSlots!.mockResolvedValue(mockTimeSlots);
    mockRepo.upsertDaySchedule!.mockResolvedValue(undefined);

    const day1 = new Date();
    day1.setDate(day1.getDate() + 1);
    const day2 = new Date();
    day2.setDate(day2.getDate() + 2);

    const result = await useCase.execute({
      userId: 'user-1',
      schedules: [
        {
          workDate: day1.toISOString().split('T')[0],
          slotIds: ['slot-1'],
        },
        {
          workDate: day2.toISOString().split('T')[0],
          slotIds: ['slot-1', 'slot-2'],
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.totalDaysUpdated).toBe(2);
    expect(mockRepo.upsertDaySchedule).toHaveBeenCalledTimes(2);
  });
});
