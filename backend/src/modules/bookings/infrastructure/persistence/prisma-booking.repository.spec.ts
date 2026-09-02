import { PrismaBookingRepository } from './prisma-booking.repository';
import { PrismaService } from '../../../../database/prisma.service';

describe('PrismaBookingRepository', () => {
  let repository: PrismaBookingRepository;
  let prismaService: any;

  beforeEach(() => {
    prismaService = {
      pets: {
        findFirst: jest.fn(),
      },
      customer_addresses: {
        findFirst: jest.fn(),
      },
      provider_working_slots: {
        findFirst: jest.fn(),
      },
      bookings: {
        findFirst: jest.fn(),
      },
      booking_checklist_items: {
        findFirst: jest.fn(),
      },
    };

    repository = new PrismaBookingRepository(prismaService as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAddressById', () => {
    it('should use findFirst and ensure deleted_at is null to prevent Soft Delete leakage', async () => {
      const addressId = 'address-123';
      const mockResult = { id: addressId, address_line: 'Test Address' };
      prismaService.customer_addresses.findFirst.mockResolvedValue(mockResult);

      const result = await repository.findAddressById(addressId);

      expect(result).toBe(mockResult);
      expect(prismaService.customer_addresses.findFirst).toHaveBeenCalledWith({
        where: { id: addressId, deleted_at: null },
      });
    });
  });

  describe('findPetById', () => {
    it('should use findFirst instead of findUnique', async () => {
      const petId = 'pet-123';
      const mockResult = { id: petId, name: 'Doggo' };
      prismaService.pets.findFirst.mockResolvedValue(mockResult);

      const result = await repository.findPetById(petId);

      expect(result).toBe(mockResult);
      expect(prismaService.pets.findFirst).toHaveBeenCalledWith({
        where: { id: petId },
      });
    });
  });
});
