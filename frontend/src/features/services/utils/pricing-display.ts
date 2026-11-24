import type { PricingRule } from '../types';

export const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const formatKg = (n: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(n);

/**
 * Nhãn khoảng cân nặng theo cách khách quen đọc:
 * 0–4,99 => "Dưới 5 kg" · 5–10 => "5 – 10 kg" · 10,01–15 => "Trên 10 – 15 kg".
 */
export function weightBandLabel(minWeight: number | null, maxWeight: number | null): string {
  const min = minWeight ?? 0;
  if (maxWeight === null) return `Trên ${formatKg(min)} kg`;
  if (min <= 0) return `Dưới ${formatKg(Math.ceil(maxWeight))} kg`;
  if (!Number.isInteger(min)) return `Trên ${formatKg(Math.floor(min))} – ${formatKg(maxWeight)} kg`;
  return `${formatKg(min)} – ${formatKg(maxWeight)} kg`;
}

/** Cân nặng tối đa có giá niêm yết (null = không giới hạn). */
export function maxPricedWeight(rules: PricingRule[]): number | null {
  if (rules.some((r) => r.maxWeight === null)) return null;
  return rules.reduce<number>((max, r) => Math.max(max, r.maxWeight ?? 0), 0);
}

export const activeRules = (rules: PricingRule[]) => rules.filter((r) => r.isActive && !r.deletedAt);

/** "30.000 – 80.000đ" hoặc mức cố định "50.000đ". */
export function formatSurchargeFee(s: { minFee: number; maxFee: number | null }): string {
  const n = (v: number) => new Intl.NumberFormat('vi-VN').format(v);
  return s.maxFee === null || s.maxFee === s.minFee ? `${n(s.minFee)}đ` : `${n(s.minFee)} – ${n(s.maxFee)}đ`;
}

export type PetPrice =
  | { requiresQuote: false; price: number; durationMinutes: number }
  | { requiresQuote: true; price: null; durationMinutes: number };

/**
 * Giá gói cho một bé — cùng quy tắc với backend (service-pricing.ts):
 * khớp loài + cân nặng (biên tính cả 2 đầu, trùng biên thì lấy dòng có min cao hơn);
 * gói chưa có bảng giá => giá gốc; có bảng giá mà không khớp dòng nào => báo giá riêng.
 */
export function computePetPrice(
  rules: PricingRule[],
  species: string,
  weight: number,
  fallback: { price: number; durationMinutes: number },
): PetPrice {
  if (rules.length === 0) return { requiresQuote: false, ...fallback };
  const w = Number.isFinite(weight) ? weight : 0;
  const matches = rules.filter((r) => {
    if (r.petSpecies.toLowerCase() !== String(species || '').toLowerCase()) return false;
    const min = r.minWeight ?? 0;
    const max = r.maxWeight ?? Number.POSITIVE_INFINITY;
    return w >= min && w <= max;
  });
  if (matches.length === 0) return { requiresQuote: true, price: null, durationMinutes: fallback.durationMinutes };
  const rule = matches.reduce((best, r) => ((r.minWeight ?? 0) > (best.minWeight ?? 0) ? r : best));
  return { requiresQuote: false, price: rule.price, durationMinutes: rule.durationMinutes };
}
