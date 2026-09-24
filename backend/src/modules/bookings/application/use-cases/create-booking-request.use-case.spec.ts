import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateBookingRequestUseCase } from './create-booking-request.use-case';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import { PrismaService } from '../../../../database/prisma.service';
import { PaymentsService } from '../../../payments/application/use-cases/payments.service';

describe('CreateBookingRequestUseCase', () => {
  let useCase: CreateBookingRequestUseCase;
  let mockBookingRepo: any;
  let mockUnitOfWork: any;
  let mockPrisma: any;
  let mockPaymentsService: any;

  beforeEach(async () => {
    mockBookingRepo = {
      findPetById: jest.fn(),
      findAddressById: jest.fn(),
      findProviderWorkingSlotById: jest.fn(),
      findProviderService: jest.fn(),
      updateWorkingSlotStatus: jest.fn(),
      createBooking: jest.fn(),
      addBookingEvent: jest.fn(),
    };

    mockUnitOfWork = {
      transaction: jest.fn((cb) => cb({})),
    };

    mockPrisma = {
      provider_profiles: { findUnique: jest.fn() },
      promotions: { findUnique: jest.fn() },
    };

    mockPaymentsService = {
      createVNPayUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBookingRequestUseCase,
        { provide: BOOKING_REPOSITORY, useValue: mockBookingRepo },
        { provide: UNIT_OF_WORK, useValue: mockUnitOfWork },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PaymentsService, useValue: mockPaymentsService },
      ],
    }).compile();

    useCase = module.get<CreateBookingRequestUseCase>(CreateBookingRequestUseCase);
  });

  it('should throw BadRequestException if slot start time is in the past', async () => {
    mockBookingRepo.findPetById.mockResolvedValue({ id: 'pet-1', customer_id: 'cust-1', species: 'Dog', weight: 5 });
    mockBookingRepo.findAddressById.mockResolvedValue({ id: 'addr-1', customer_id: 'cust-1' });
    mockBookingRepo.findProviderWorkingSlotById.mockResolvedValue({
      id: 'slot-1',
      slot_id: 'ts-1',
      provider_working_days: {
        provider_id: 'prov-1',
        work_date: new Date('2020-01-01'), // Past date
      },
      time_slots: {
        start_time: '08:00',
        end_time: '10:00',
      },
    });
    mockBookingRepo.findProviderService.mockResolvedValue({
      id: 'ps-1',
      price: 200000,
      services: { duration_minutes: 60, name: 'Tắm spa' },
    });
    mockPrisma.provider_profiles.findUnique.mockResolvedValue({
      id: 'prov-1',
    });

    const dto = {
      petId: 'pet-1',
      providerWorkingSlotId: 'slot-1',
      addressId: 'addr-1',
      serviceId: 'srv-1',
    };

    await expect(useCase.execute('cust-1', dto)).rejects.toThrow(BadRequestException);
    await expect(useCase.execute('cust-1', dto)).rejects.toThrow('Thời gian bắt đầu ca làm việc phải ở tương lai.');
  });

  it('should reserve slot with HELD_FOR_PAYMENT and 10 mins expiration for valid future slot', async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dateStr = futureDate.toISOString().split('T')[0];

    mockBookingRepo.findPetById.mockResolvedValue({ id: 'pet-1', customer_id: 'cust-1', species: 'Dog', weight: 5 });
    mockBookingRepo.findAddressById.mockResolvedValue({ id: 'addr-1', customer_id: 'cust-1' });
    mockBookingRepo.findProviderWorkingSlotById.mockResolvedValue({
      id: 'slot-1',
      slot_id: 'ts-1',
      provider_working_days: {
        provider_id: 'prov-1',
        work_date: new Date(`${dateStr}T00:00:00.000Z`),
      },
      time_slots: {
        start_time: '08:00',
        end_time: '10:00',
      },
    });
    mockBookingRepo.findProviderService.mockResolvedValue({
      id: 'ps-1',
      price: 200000,
      services: { duration_minutes: 60, name: 'Tắm spa' },
    });
    mockPrisma.provider_profiles.findUnique.mockResolvedValue({
      id: 'prov-1',
    });

    mockBookingRepo.updateWorkingSlotStatus.mockResolvedValue(1);
    mockBookingRepo.createBooking.mockResolvedValue({ id: 'booking-1', total_price: 200000 });
    mockPaymentsService.createVNPayUrl.mockResolvedValue('https://sandbox.vnpayment.vn/test');

    const dto = {
      petId: 'pet-1',
      providerWorkingSlotId: 'slot-1',
      addressId: 'addr-1',
      serviceId: 'srv-1',
    };

    const result = await useCase.execute('cust-1', dto);

    expect(mockBookingRepo.updateWorkingSlotStatus).toHaveBeenCalledWith(
      'slot-1',
      'HELD_FOR_PAYMENT',
      expect.any(Date),
      expect.anything(),
    );
    expect(result.booking.id).toBe('booking-1');
    expect(result.paymentUrl).toBe('https://sandbox.vnpayment.vn/test');
  });
});
