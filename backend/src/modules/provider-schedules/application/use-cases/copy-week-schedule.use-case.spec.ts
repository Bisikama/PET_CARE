import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CopyWeekScheduleUseCase } from './copy-week-schedule.use-case';
import { PROVIDER_SCHEDULES_REPOSITORY } from '../../provider-schedules.tokens';
import { ProviderSchedulesRepositoryPort } from '../ports/provider-schedules.repository.port';

describe('CopyWeekScheduleUseCase', () => {
  let useCase: CopyWeekScheduleUseCase;
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
  ];

  beforeEach(async () => {
    mockRepo = {
      findProviderProfileByUserId: jest.fn(),
      findAllTimeSlots: jest.fn(),
      copyWeekSchedule: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CopyWeekScheduleUseCase,
        {
          provide: PROVIDER_SCHEDULES_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CopyWeekScheduleUseCase>(CopyWeekScheduleUseCase);
  });

  it('should throw NotFoundException if provider profile not found', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'user-1',
        sourceWeekStart: '2026-09-01',
        targetWeekStart: '2026-09-08',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if target week is completely in the past', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue({ id: 'provider-1' });

    await expect(
      useCase.execute({
        userId: 'user-1',
        sourceWeekStart: '2020-01-01',
        targetWeekStart: '2020-01-08',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should copy week schedule successfully', async () => {
    mockRepo.findProviderProfileByUserId!.mockResolvedValue({ id: 'provider-1' });
    mockRepo.findAllTimeSlots!.mockResolvedValue(mockTimeSlots);
    mockRepo.copyWeekSchedule!.mockResolvedValue(undefined);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const targetDateStr = futureDate.toISOString().split('T')[0];

    const result = await useCase.execute({
      userId: 'user-1',
      sourceWeekStart: '2026-09-01',
      targetWeekStart: targetDateStr,
    });

    expect(result.success).toBe(true);
    expect(mockRepo.copyWeekSchedule).toHaveBeenCalledTimes(1);
  });
});
