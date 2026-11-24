import { useEffect, useState } from 'react';
import { servicesService } from '../services/services.service';
import { activeRules, computePetPrice, type PetPrice } from '../utils/pricing-display';
import type { Service } from '../types';

/**
 * Giá của từng gói cho bé đã chọn (theo loài + cân nặng). Trả về map serviceId → giá;
 * gói chưa tải xong thì chưa có trong map.
 */
export function usePetPackagePrices(
  services: Service[],
  pet: { species: string; weight?: number | null } | null | undefined,
) {
  const [prices, setPrices] = useState<Record<string, PetPrice>>({});
  const ids = services.map((s) => s.id).join(',');
  const species = pet?.species ?? '';
  const weight = Number(pet?.weight) || 0;

  useEffect(() => {
    if (!pet || services.length === 0) {
      setPrices({});
      return;
    }
    let cancelled = false;
    Promise.all(
      services.map(async (s) => {
        const rules = await servicesService.getPricingRules(s.id).catch(() => []);
        return [
          s.id,
          computePetPrice(activeRules(rules || []), species, weight, {
            price: s.basePrice,
            durationMinutes: s.durationMinutes,
          }),
        ] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setPrices(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, species, weight]);

  return prices;
}
