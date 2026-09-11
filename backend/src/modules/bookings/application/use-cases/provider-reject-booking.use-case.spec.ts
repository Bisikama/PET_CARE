import { Test, TestingModule } from '@nestjs/testing';
import { ProviderRejectBookingUseCase } from './provider-reject-booking.use-case';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';
import { NotificationsService } from '../../../growth/notifications/notifications.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProviderRejectBookingUseCase', () => {
  let useCase: ProviderRejectBookingUseCase;
  let stateMachine: BookingStateMachineService;
  let settlementsService: SettlementsService;
  let notificationsService: NotificationsService;
  let bookingRepo: any;
  let unitOfWork: any;

  const mockBookingRepo = {
    findBookingById: jest.fn(),
    findProviderWorkingSlotById: jest.fn(),
    updateBookingStatus: jest.fn(),
    updateWorkingSlotStatus: jest.fn(),
    addBookingEvent: jest.fn(),
  };

  const mockTx = {};

  const mockUnitOfWork = {
    transaction: jest.fn((callback) => callback(mockTx)),
  };

  const mockStateMachine = {
    providerReject: jest.fn(),
  };

  const mockSettlementsService = {
    refund: jest.fn(),
  };

  const mockNotificationsService = {
    sendNotification: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderRejectBookingUseCase,
        { provide: BOOKING_REPOSITORY, useValue: mockBookingRepo },
        { provide: UNIT_OF_WORK, useValue: mockUnitOfWork },
        { provide: BookingStateMachineService, useValue: mockStateMachine },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: SettlementsService, useValue: mockSettlementsService },
      ],
    }).compile();

    useCase = module.get<ProviderRejectBookingUseCase>(ProviderRejectBookingUseCase);
    stateMachine = module.get<BookingStateMachineService>(BookingStateMachineService);
    settlementsService = module.get<SettlementsService>(SettlementsService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
    bookingRepo = module.get(BOOKING_REPOSITORY);
    unitOfWork = module.get(UNIT_OF_WORK);
  });

  it('should throw NotFoundException if booking not found', async () => {
    mockBookingRepo.findBookingById.mockResolvedValue(null);

    await expect(useCase.execute('provider-1', 'booking-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if slot not found', async () => {
    mockBookingRepo.findBookingById.mockResolvedValue({
      id: 'booking-1',
      provider_working_slot_id: 'slot-1',
    });
    mockBookingRepo.findProviderWorkingSlotById.mockResolvedValue(null);

    await expect(useCase.execute('provider-1', 'booking-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not the assigned provider', async () => {
    mockBookingRepo.findBookingById.mockResolvedValue({
      id: 'booking-1',
      provider_working_slot_id: 'slot-1',
    });
    mockBookingRepo.findProviderWorkingSlotById.mockResolvedValue({
      provider_working_days: {
        provider_profiles: { user_id: 'other-provider' },
      },
    });

    await expect(useCase.execute('provider-1', 'booking-1')).rejects.toThrow(ForbiddenException);
  });

  it('should reject booking, call refund, and send notification', async () => {
    mockBookingRepo.findBookingById.mockResolvedValue({
      id: 'booking-1',
      status: 'PENDING_PROVIDER_ACCEPTANCE',
      customer_id: 'customer-1',
      provider_working_slot_id: 'slot-1',
    });
    mockBookingRepo.findProviderWorkingSlotById.mockResolvedValue({
      provider_working_days: {
        provider_profiles: { user_id: 'provider-1' },
      },
    });
    mockStateMachine.providerReject.mockReturnValue('REJECTED');

    const result = await useCase.execute('provider-1', 'booking-1');

    expect(result).toEqual({ bookingId: 'booking-1', status: 'REJECTED' });
    expect(mockStateMachine.providerReject).toHaveBeenCalledWith('PENDING_PROVIDER_ACCEPTANCE');
    expect(mockBookingRepo.updateBookingStatus).toHaveBeenCalledWith('booking-1', 'REJECTED', mockTx);
    expect(mockBookingRepo.updateWorkingSlotStatus).toHaveBeenCalledWith('slot-1', 'AVAILABLE', null, mockTx);
    expect(mockBookingRepo.addBookingEvent).toHaveBeenCalledWith(
      'booking-1',
      'provider-1',
      'PROVIDER_REJECTED',
      'Booking request rejected by provider',
      mockTx,
    );
    expect(mockSettlementsService.refund).toHaveBeenCalledWith('booking-1', mockTx, 'Đối tác từ chối đơn đặt lịch', 'REJECTED');
    expect(mockNotificationsService.sendNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'customer-1',
        type: 'BOOKING_REJECTED',
        metadata: { bookingId: 'booking-1', status: 'REJECTED' },
      }),
    );
  });
});
