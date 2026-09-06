import { Test, TestingModule } from '@nestjs/testing';
import { CalculateDistanceUseCase } from './calculate-distance.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CalculateDistanceUseCase', () => {
  let useCase: CalculateDistanceUseCase;
  let prisma: PrismaService;

  const mockPrisma = {
    customer_addresses: {
      findUnique: jest.fn(),
    },
    provider_profiles: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateDistanceUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<CalculateDistanceUseCase>(CalculateDistanceUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should calculate distance correctly with explicit coordinates (Haversine * 1.3)', async () => {
    // Tọa độ Bến Thành (10.7721, 106.6983) đến Landmark 81 (10.7951, 106.7218) ~ 3.61 km đường chim bay, ~ 4.69 km đường thực tế
    const result = await useCase.execute({
      originLatitude: 10.7721,
      originLongitude: 106.6983,
      destinationLatitude: 10.7951,
      destinationLongitude: 106.7218,
    });

    expect(result.straightLineDistanceKm).toBeCloseTo(3.61, 1);
    expect(result.estimatedRoadDistanceKm).toBeCloseTo(3.61 * 1.3, 1);
    expect(result.roadFactor).toBe(1.3);
    expect(result.estimatedDurationMinutes).toBeGreaterThan(0);
    expect(result.travelSurcharge).toBeGreaterThan(0);
  });

  it('should calculate distance using addressId and providerId from database', async () => {
    mockPrisma.customer_addresses.findUnique.mockResolvedValue({
      id: 'addr-1',
      latitude: 10.7721,
      longitude: 106.6983,
      formatted_address: 'Quận 1, TP.HCM',
    });

    mockPrisma.provider_profiles.findUnique.mockResolvedValue({
      id: 'prov-1',
      base_latitude: 10.7951,
      base_longitude: 106.7218,
      base_formatted: 'Bình Thạnh, TP.HCM',
      service_radius_km: 10,
    });

    const result = await useCase.execute({
      addressId: 'addr-1',
      providerId: 'prov-1',
    });

    expect(result.isWithinServiceRadius).toBe(true);
    expect(result.origin.addressLine).toBe('Quận 1, TP.HCM');
    expect(result.destination.addressLine).toBe('Bình Thạnh, TP.HCM');
  });

  it('should throw NotFoundException if addressId does not exist', async () => {
    mockPrisma.customer_addresses.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute({
        addressId: 'non-existent',
        destinationLatitude: 10.7951,
        destinationLongitude: 106.7218,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if origin coordinates are missing', async () => {
    await expect(
      useCase.execute({
        destinationLatitude: 10.7951,
        destinationLongitude: 106.7218,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
