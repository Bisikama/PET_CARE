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

