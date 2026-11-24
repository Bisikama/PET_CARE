import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Giá niêm yết của hệ thống theo gói dịch vụ + loài + cân nặng (bảng `service_pricing_rules`).
 *
 * - Gói có bảng giá: giá & thời lượng lấy theo dòng khớp cân nặng. Không dòng nào khớp
 *   (VD thú cưng trên 30 kg) => gói này cần báo giá riêng, không đặt online được.
 * - Gói chưa cấu hình bảng giá (dữ liệu cũ): dùng giá đối tác / giá gốc truyền vào `fallback`.
 */

export interface PricingRuleLike {
  pet_species: string;
  min_weight: Prisma.Decimal | number | null;
  max_weight: Prisma.Decimal | number | null;
  price: Prisma.Decimal | number;
  duration_minutes: number;
}

export type ServicePriceResult =
  | { requiresQuote: false; price: number; durationMinutes: number; source: 'RULE' | 'FALLBACK' }
  | { requiresQuote: true; price: null; durationMinutes: number; source: 'RULE' };

/**
 * Chọn dòng giá cho cân nặng. Biên được tính bao gồm cả 2 đầu; nếu 2 dòng cùng khớp
 * (VD 5 kg nằm ở biên "dưới 5" và "5–10") thì ưu tiên dòng có min cao hơn.
 */
export function matchPricingRule<T extends PricingRuleLike>(
  rules: T[],
  species: string,
  weight: number,
): T | null {
  const w = Number.isFinite(weight) ? weight : 0;
  const candidates = rules.filter((r) => {
    if (r.pet_species.toLowerCase() !== String(species || '').toLowerCase()) return false;
    const min = r.min_weight === null ? 0 : Number(r.min_weight);
    const max = r.max_weight === null ? Number.POSITIVE_INFINITY : Number(r.max_weight);
    return w >= min && w <= max;
  });
  if (candidates.length === 0) return null;
  return candidates.reduce((best, r) =>
    Number(r.min_weight ?? 0) > Number(best.min_weight ?? 0) ? r : best,
  );
}

export function computeServicePrice(
  rules: PricingRuleLike[],
  species: string,
  weight: number,
  fallback: { price: number; durationMinutes: number },
): ServicePriceResult {
  if (rules.length === 0) {
    return { requiresQuote: false, source: 'FALLBACK', ...fallback };
  }
  const rule = matchPricingRule(rules, species, weight);
  if (!rule) {
    return {
      requiresQuote: true,
      price: null,
      durationMinutes: fallback.durationMinutes,
      source: 'RULE',
    };
  }
  return {
    requiresQuote: false,
    source: 'RULE',
    price: Math.round(Number(rule.price)),
    durationMinutes: rule.duration_minutes,
  };
}

type PricingClient = {
  service_pricing_rules: {
    findMany: (args: {
      where: Prisma.service_pricing_rulesWhereInput;
    }) => Promise<PricingRuleLike[]>;
  };
};

/**
 * Giá phải trả cho một gói (dùng khi báo giá và tạo booking). Ném lỗi nếu cần báo giá riêng.
 */
export async function resolveBookableServicePrice(
  client: PricingClient,
  params: {
    serviceId: string;
    species: string;
    weight: number;
    fallback: { price: number; durationMinutes: number };
  },
): Promise<{ price: number; durationMinutes: number; source: 'RULE' | 'FALLBACK' }> {
  const rules = await client.service_pricing_rules.findMany({
    where: { service_id: params.serviceId, is_active: true, deleted_at: null },
  });
  const result = computeServicePrice(rules, params.species, params.weight, params.fallback);
  if (result.requiresQuote) {
    throw new BadRequestException(
      `Gói dịch vụ chưa có giá niêm yết cho thú cưng ${params.weight} kg. ` +
        'Vui lòng liên hệ PetCare để được báo giá riêng.',
    );
  }
  return result;
}
