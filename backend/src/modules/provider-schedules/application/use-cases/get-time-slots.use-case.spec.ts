import { Test, TestingModule } from '@nestjs/testing';
import { GetTimeSlotsUseCase } from './get-time-slots.use-case';
import { PROVIDER_SCHEDULES_REPOSITORY } from '../../provider-schedules.tokens';
import { ProviderSchedulesRepositoryPort } from '../ports/provider-schedules.repository.port';

describe('GetTimeSlotsUseCase', () => {
  let useCase: GetTimeSlotsUseCase;
  let mockRepo: Partial<jest.Mocked<ProviderSchedulesRepositoryPort>>;

  beforeEach(async () => {
    mockRepo = {
      findAllTimeSlots: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTimeSlotsUseCase,
        {
          provide: PROVIDER_SCHEDULES_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetTimeSlotsUseCase>(GetTimeSlotsUseCase);
  });

  it('should return all master time slots', async () => {
    const fakeSlots = [
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

    mockRepo.findAllTimeSlots!.mockResolvedValue(fakeSlots);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Slot 1 (07:00 - 08:30)');
    expect(mockRepo.findAllTimeSlots).toHaveBeenCalledTimes(1);
  });
});
