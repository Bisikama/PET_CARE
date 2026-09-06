import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BatchUpdateChecklistUseCase } from './batch-update-checklist.use-case';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';

describe('BatchUpdateChecklistUseCase', () => {
  let useCase: BatchUpdateChecklistUseCase;
  let bookingRepo: any;
  let unitOfWork: any;

  const mockProviderUserId = 'provider-user-1';
  const mockBookingId = 'booking-123';
  const mockBooking = {
    id: mockBookingId,
    status: 'IN_PROGRESS',
    provider_working_slots: {
      provider_working_days: {
        provider_profiles: {
          user_id: mockProviderUserId,
        },
      },
    },
  };

  const mockDto = {
    items: [
      {
        itemId: 'item-1',
        status: 'DONE' as const,
        note: 'Đã hoàn thành bước 1',
      },
      {
        itemId: 'item-2',
        status: 'DONE' as const,
        note: 'Đã hoàn thành bước 2',
      },
    ],
  };

  beforeEach(async () => {
    bookingRepo = {
      findBookingById: jest.fn().mockResolvedValue(mockBooking),
      findChecklistItemById: jest.fn().mockImplementation((id: string) => {
        return Promise.resolve({
          id,
          booking_id: mockBookingId,
          title: `Checklist Item ${id}`,
          status: 'PENDING',
        });
      }),
      updateChecklistItem: jest.fn().mockImplementation((id: string, data: any) => {
        return Promise.resolve({
          id,
          title: `Checklist Item ${id}`,
          status: data.status,
          note: data.note,
          completed_at: data.completed_at,
        });
      }),
      addBookingEvent: jest.fn().mockResolvedValue({}),
    };

    unitOfWork = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        return callback({});
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchUpdateChecklistUseCase,
        {
          provide: BOOKING_REPOSITORY,
          useValue: bookingRepo,
        },
        {
          provide: UNIT_OF_WORK,
          useValue: unitOfWork,
        },
      ],
    }).compile();

    useCase = module.get<BatchUpdateChecklistUseCase>(BatchUpdateChecklistUseCase);
  });

  it('should batch update checklist items successfully', async () => {
    const result = await useCase.execute(mockProviderUserId, mockBookingId, mockDto);

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[0].status).toBe('DONE');
    expect(result.items[1].status).toBe('DONE');
    expect(bookingRepo.updateChecklistItem).toHaveBeenCalledTimes(2);
    expect(bookingRepo.addBookingEvent).toHaveBeenCalledWith(
      mockBookingId,
      mockProviderUserId,
      'CHECKLIST_ITEM_COMPLETED',
      expect.stringContaining('2 checklist item(s)'),
      expect.anything(),
    );
  });

  it('should throw NotFoundException if booking not found', async () => {
    bookingRepo.findBookingById.mockResolvedValue(null);

    await expect(
      useCase.execute(mockProviderUserId, mockBookingId, mockDto),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not the assigned provider', async () => {
    await expect(
      useCase.execute('other-provider-user', mockBookingId, mockDto),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if any checklist item does not belong to booking', async () => {
    bookingRepo.findChecklistItemById.mockResolvedValueOnce({
      id: 'item-1',
      booking_id: 'different-booking-id',
      title: 'Different booking item',
    });

    await expect(
      useCase.execute(mockProviderUserId, mockBookingId, mockDto),
    ).rejects.toThrow(NotFoundException);
  });
});
