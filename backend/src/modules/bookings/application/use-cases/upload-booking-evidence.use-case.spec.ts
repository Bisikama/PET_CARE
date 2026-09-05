import { Test, TestingModule } from '@nestjs/testing';
import { UploadBookingEvidenceUseCase } from './upload-booking-evidence.use-case';
import { BOOKING_REPOSITORY } from '../../booking.tokens';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('UploadBookingEvidenceUseCase', () => {
  let useCase: UploadBookingEvidenceUseCase;
  let mockBookingRepo: { findBookingById: jest.Mock };
  let mockStorageService: { uploadFile: jest.Mock };

  beforeEach(async () => {
    mockBookingRepo = {
      findBookingById: jest.fn(),
    };
    mockStorageService = {
      uploadFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadBookingEvidenceUseCase,
        { provide: BOOKING_REPOSITORY, useValue: mockBookingRepo },
        { provide: SupabaseStorageService, useValue: mockStorageService },
      ],
    }).compile();

    useCase = module.get<UploadBookingEvidenceUseCase>(UploadBookingEvidenceUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockFile = {
    originalname: 'evidence1.png',
    mimetype: 'image/png',
    buffer: Buffer.from('fake image content'),
  } as Express.Multer.File;

  it('should upload booking evidence successfully by assigned provider', async () => {
    const bookingId = 'booking-123';
    const providerUserId = 'provider-user-1';
    const mockBooking = {
      id: bookingId,
      customer_id: 'customer-1',
      provider_working_slots: {
        provider_working_days: {
          provider_profiles: {
            user_id: providerUserId,
          },
        },
      },
    };

    mockBookingRepo.findBookingById.mockResolvedValue(mockBooking);
    mockStorageService.uploadFile.mockResolvedValue('https://storage.supabase.co/booking-media/evidence-123.png');

    const result = await useCase.execute(providerUserId, bookingId, mockFile);

    expect(result.success).toBe(true);
    expect(result.mediaUrl).toBe('https://storage.supabase.co/booking-media/evidence-123.png');
    expect(mockStorageService.uploadFile).toHaveBeenCalledWith(
      mockFile,
      'booking-media',
      expect.stringContaining(`bookings/${bookingId}/evidence-`),
    );
  });

  it('should throw NotFoundException if booking does not exist', async () => {
    mockBookingRepo.findBookingById.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'invalid-id', mockFile)).rejects.toThrow(NotFoundException);
    expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException if user is neither assigned provider nor customer', async () => {
    const bookingId = 'booking-123';
    const mockBooking = {
      id: bookingId,
      customer_id: 'customer-1',
      provider_working_slots: {
        provider_working_days: {
          provider_profiles: {
            user_id: 'assigned-provider-id',
          },
        },
      },
    };

    mockBookingRepo.findBookingById.mockResolvedValue(mockBooking);

    await expect(useCase.execute('unauthorized-user', bookingId, mockFile)).rejects.toThrow(ForbiddenException);
    expect(mockStorageService.uploadFile).not.toHaveBeenCalled();
  });
});
