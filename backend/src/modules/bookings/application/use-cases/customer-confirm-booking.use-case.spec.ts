import { CustomerConfirmBookingUseCase } from './customer-confirm-booking.use-case';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';

describe('CustomerConfirmBookingUseCase', () => {
  let useCase: CustomerConfirmBookingUseCase;
  let bookingRepo: any;
  let unitOfWork: any;
  let stateMachine: BookingStateMachineService;
  let settlementsService: any;

  beforeEach(() => {
    bookingRepo = {
      findBookingById: jest.fn(),
      updateBookingStatus: jest.fn(),
      addBookingStatusLog: jest.fn(),
      addBookingEvent: jest.fn(),
    };
    unitOfWork = {
      transaction: jest.fn().mockImplementation(async (cb) => {
        return cb({});
      }),
    };
    stateMachine = new BookingStateMachineService();
    settlementsService = {
      releaseEscrow: jest.fn(),
    };

    useCase = new CustomerConfirmBookingUseCase(
      bookingRepo,
      unitOfWork,
      stateMachine,
      settlementsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw NotFoundException if booking not found', async () => {
    bookingRepo.findBookingById.mockResolvedValue(null);

    await expect(useCase.execute('cust-1', 'bk-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if customerId does not match', async () => {
    bookingRepo.findBookingById.mockResolvedValue({
      id: 'bk-1',
      customer_id: 'cust-2',
    });

    await expect(useCase.execute('cust-1', 'bk-1')).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException if status is not AWAITING_CUSTOMER_CONFIRMATION', async () => {
    bookingRepo.findBookingById.mockResolvedValue({
      id: 'bk-1',
      customer_id: 'cust-1',
      status: 'ACCEPTED',
    });

    await expect(useCase.execute('cust-1', 'bk-1')).rejects.toThrow(BadRequestException);
  });

  it('should update status to COMPLETED and release escrow successfully', async () => {
    bookingRepo.findBookingById.mockResolvedValue({
      id: 'bk-1',
      customer_id: 'cust-1',
      status: 'AWAITING_CUSTOMER_CONFIRMATION',
    });

    const result = await useCase.execute('cust-1', 'bk-1');

    expect(result.success).toBe(true);
    expect(result.status).toBe('COMPLETED');
    expect(bookingRepo.updateBookingStatus).toHaveBeenCalledWith('bk-1', 'COMPLETED', expect.anything());
    expect(bookingRepo.addBookingStatusLog).toHaveBeenCalledWith(
      'bk-1',
      'AWAITING_CUSTOMER_CONFIRMATION',
      'COMPLETED',
      'cust-1',
      expect.any(String),
      expect.anything(),
    );
    expect(bookingRepo.addBookingEvent).toHaveBeenCalledWith(
      'bk-1',
      'cust-1',
      'CUSTOMER_CONFIRMED',
      expect.any(String),
      expect.anything(),
    );
    expect(settlementsService.releaseEscrow).toHaveBeenCalledWith('bk-1', expect.anything());
  });
});
