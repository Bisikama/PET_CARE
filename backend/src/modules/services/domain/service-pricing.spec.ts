import { BadRequestException } from '@nestjs/common';
import {
  computeServicePrice,
  matchPricingRule,
  resolveBookableServicePrice,
} from './service-pricing';

// Bảng giá Basic Bath như trong migration 20261124100000_service_packages_basic_clean
const band = (min: number, max: number, price: number, species = 'Dog') => ({
  pet_species: species,
  min_weight: min,
  max_weight: max,
  price,
  duration_minutes: 60,
});
const BASIC_BATH = [
  band(0, 4.99, 149000),
  band(5, 10, 189000),
  band(10.01, 15, 229000),
  band(15.01, 20, 279000),
  band(20.01, 30, 349000),
  band(0, 4.99, 149000, 'Cat'),
];
const FALLBACK = { price: 999000, durationMinutes: 45 };

describe('service pricing', () => {
  it.each([
    [0.5, 149000],
    [4.99, 149000],
    [5, 189000], // "5–10 kg" gồm 5 kg
    [10, 189000], // ... và 10 kg
    [10.5, 229000],
    [15, 229000],
    [20, 279000],
    [25, 349000],
    [30, 349000],
  ])('prices a %s kg dog at %i', (weight, expected) => {
    expect(computeServicePrice(BASIC_BATH, 'Dog', weight, FALLBACK)).toEqual({
      requiresQuote: false,
      source: 'RULE',
      price: expected,
      durationMinutes: 60,
    });
  });

  it('matches species case-insensitively', () => {
    expect(matchPricingRule(BASIC_BATH, 'cat', 3)?.price).toBe(149000);
  });

  it('requires a custom quote above 30 kg or for an unpriced species', () => {
    expect(computeServicePrice(BASIC_BATH, 'Dog', 31, FALLBACK).requiresQuote).toBe(true);
    expect(computeServicePrice(BASIC_BATH, 'Rabbit', 2, FALLBACK).requiresQuote).toBe(true);
  });

  it('prefers the higher band when two bands share a boundary', () => {
    const overlapping = [band(0, 5, 100), band(5, 10, 200)];
    expect(matchPricingRule(overlapping, 'Dog', 5)?.price).toBe(200);
  });

  it('falls back to the provider/base price when the package has no price table', () => {
    expect(computeServicePrice([], 'Dog', 50, FALLBACK)).toEqual({
      requiresQuote: false,
      source: 'FALLBACK',
      ...FALLBACK,
    });
  });

  it('resolveBookableServicePrice throws for pets that need a custom quote', async () => {
    const client = { service_pricing_rules: { findMany: jest.fn().mockResolvedValue(BASIC_BATH) } };
    await expect(
      resolveBookableServicePrice(client, {
        serviceId: 's',
        species: 'Dog',
        weight: 35,
        fallback: FALLBACK,
      }),
    ).rejects.toThrow(BadRequestException);
    await expect(
      resolveBookableServicePrice(client, {
        serviceId: 's',
        species: 'Dog',
        weight: 7,
        fallback: FALLBACK,
      }),
    ).resolves.toEqual({
      requiresQuote: false,
      source: 'RULE',
      price: 189000,
      durationMinutes: 60,
    });
    expect(client.service_pricing_rules.findMany).toHaveBeenCalledWith({
      where: { service_id: 's', is_active: true, deleted_at: null },
    });
  });
});
