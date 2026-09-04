import { Test, TestingModule } from '@nestjs/testing';
import { AutoReleaseEscrowCron } from './auto-release-escrow.cron';
import { PrismaService } from '../../../../database/prisma.service';
import { SettlementsService } from '../../../settlements/application/use-cases/settlements.service';
import { BookingStateMachineService } from '../../domain/services/booking-state-machine.service';
import { booking_status } from '@prisma/client';

describe('AutoReleaseEscrowCron', () => {
  let cron: AutoReleaseEscrowCron;
  let prisma: PrismaService;
  let settlementsService: SettlementsService;
  let stateMachine: BookingStateMachineService;

  const mockPrisma = {
    bookings: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    booking_status_logs: {
      create: jest.fn(),
    },
    booking_events: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => cb(mockPrisma)),
  };

  const mockSettlements = {
    releaseEscrow: jest.fn(),
  };

  const mockStateMachine = {
    customerConfirmBooking: jest.fn().mockReturnValue(booking_status.COMPLETED),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoReleaseEscrowCron,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SettlementsService, useValue: mockSettlements },
        { provide: BookingStateMachineService, useValue: mockStateMachine },
      ],
    }).compile();

    cron = module.get<AutoReleaseEscrowCron>(AutoReleaseEscrowCron);
    prisma = module.get<PrismaService>(PrismaService);
    settlementsService = module.get<SettlementsService>(SettlementsService);
    stateMachine = module.get<BookingStateMachineService>(BookingStateMachineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process bookings waiting for customer confirmation over 3 days', async () => {
    // Arrange
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 4);

    mockPrisma.bookings.findMany.mockResolvedValue([
      { id: 'b1', status: booking_status.AWAITING_CUSTOMER_CONFIRMATION, updated_at: oldDate },
    ]);

    // Act
    await cron.handleAutoReleaseEscrow();

    // Assert
    expect(mockPrisma.bookings.findMany).toHaveBeenCalled();
    expect(mockStateMachine.customerConfirmBooking).toHaveBeenCalledWith(booking_status.AWAITING_CUSTOMER_CONFIRMATION);
    expect(mockPrisma.bookings.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'b1' },
        data: expect.objectContaining({ status: booking_status.COMPLETED }),
      })
    );
    expect(mockPrisma.booking_events.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ event_type: 'AUTO_COMPLETED' })
      })
    );
    expect(mockSettlements.releaseEscrow).toHaveBeenCalledWith('b1', mockPrisma);
  });
});
