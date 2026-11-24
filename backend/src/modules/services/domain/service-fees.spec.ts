import { BadRequestException } from '@nestjs/common';
import { GeoLocationHelper } from '../../../common/utils/geo-location.helper';
import { ManageServiceFeesUseCase } from '../application/use-cases/manage-service-fees.use-case';
import {
  DEFAULT_SURCHARGES,
  DEFAULT_TRAVEL_POLICY,
  FEE_CONFIG_KEYS,
  loadTravelPolicy,
  parseFeeSettings,
} from './service-fees';

describe('service fee settings', () => {
  it('falls back to defaults when nothing is configured or data is corrupt', () => {
    expect(parseFeeSettings([])).toEqual({
      travel: DEFAULT_TRAVEL_POLICY,
      surcharges: DEFAULT_SURCHARGES,
    });
    expect(
      parseFeeSettings([
        { key: FEE_CONFIG_KEYS.travelFreeKm, value: 'abc' },
        { key: FEE_CONFIG_KEYS.travelPerKm, value: '-1' },
        { key: FEE_CONFIG_KEYS.surcharges, value: '{not json' },
      ]),
    ).toEqual({ travel: DEFAULT_TRAVEL_POLICY, surcharges: DEFAULT_SURCHARGES });
  });

  it('reads admin-configured values', () => {
    const settings = parseFeeSettings([
      { key: FEE_CONFIG_KEYS.travelFreeKm, value: '3' },
      { key: FEE_CONFIG_KEYS.travelPerKm, value: '7000' },
      {
        key: FEE_CONFIG_KEYS.surcharges,
        value: '[{"label":"Ngoài giờ","minFee":60000,"maxFee":null}]',
      },
    ]);
    expect(settings).toEqual({
      travel: { freeKm: 3, perKm: 7000 },
      surcharges: [{ label: 'Ngoài giờ', minFee: 60000, maxFee: null }],
    });
  });

  it('loadTravelPolicy never blocks booking when the config read fails', async () => {
    const client = {
      system_configs: { findMany: jest.fn().mockRejectedValue(new Error('db down')) },
    };
    await expect(loadTravelPolicy(client)).resolves.toEqual(DEFAULT_TRAVEL_POLICY);
  });

  it('GeoLocationHelper charges travel using the configured policy', () => {
    const origin = { latitude: 10.7721, longitude: 106.6983 };
    const destination = { latitude: 10.7951, longitude: 106.7218 }; // ~4,7 km đường đi
    expect(GeoLocationHelper.calculateRoadDistance(origin, destination, 10).travelSurcharge).toBe(
      0,
    );

    const result = GeoLocationHelper.calculateRoadDistance(origin, destination, 10, {
      freeKm: 2,
      perKm: 10000,
    });
    const chargeable = Number((result.estimatedRoadDistanceKm - 2).toFixed(2));
    expect(result.travelSurcharge).toBe(Math.round(chargeable * 10000));
    expect(result.pricingFormula).toEqual(
      expect.objectContaining({ freeDistanceKm: 2, ratePerKm: 10000 }),
    );
  });
});

describe('ManageServiceFeesUseCase.updateSettings', () => {
  const prisma: any = {
    system_configs: { findMany: jest.fn().mockResolvedValue([]), upsert: jest.fn() },
    audit_logs: { create: jest.fn() },
    $transaction: jest.fn((fn) => fn(prisma)),
  };
  const useCase = new ManageServiceFeesUseCase(prisma);

  afterEach(() => jest.clearAllMocks());

  it('stores travel policy and surcharges, and writes an audit log', async () => {
    const result = await useCase.updateSettings('admin-1', {
      travel: { freeKm: 4, perKm: 6000 },
      surcharges: [
        { label: 'Lông dài', minFee: 30000, maxFee: 80000 },
        { label: 'Ngoài giờ', minFee: 50000, maxFee: 50000 }, // bằng nhau => mức cố định
      ],
    });

    expect(result.surcharges[1]).toEqual({ label: 'Ngoài giờ', minFee: 50000, maxFee: null });
    expect(prisma.system_configs.upsert).toHaveBeenCalledTimes(3);
    expect(prisma.system_configs.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: FEE_CONFIG_KEYS.travelPerKm },
        update: expect.objectContaining({ value: '6000' }),
      }),
    );
    expect(prisma.audit_logs.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ actor_id: 'admin-1', action: 'UPDATE_SERVICE_FEES' }),
    });
  });

  it('rejects a range whose max is below its min', async () => {
    await expect(
      useCase.updateSettings('admin-1', {
        travel: { freeKm: 5, perKm: 5000 },
        surcharges: [{ label: 'Sai', minFee: 80000, maxFee: 30000 }],
      }),
    ).rejects.toThrow(BadRequestException);
    expect(prisma.system_configs.upsert).not.toHaveBeenCalled();
  });
});
