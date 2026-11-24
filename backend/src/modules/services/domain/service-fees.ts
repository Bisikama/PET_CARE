/**
 * Phí di chuyển & phụ phí dịch vụ do admin cấu hình (lưu trong `system_configs`).
 *
 * - Phí di chuyển: hệ thống TỰ TÍNH khi báo giá / tạo booking (miễn phí N km đầu, sau đó X đ/km).
 * - Phụ phí khác (lông dài, gỡ rối...): chỉ hiển thị cho khách tham khảo, thống nhất trước khi thực hiện.
 */

export const FEE_CONFIG_KEYS = {
  travelFreeKm: 'TRAVEL_FREE_DISTANCE_KM',
  travelPerKm: 'TRAVEL_SURCHARGE_PER_KM',
  surcharges: 'SERVICE_SURCHARGES',
} as const;

export interface TravelPolicy {
  /** Số km đầu miễn phí */
  freeKm: number;
  /** Phí mỗi km vượt thêm (VND) */
  perKm: number;
}

export interface ServiceSurcharge {
  label: string;
  minFee: number;
  /** null = mức cố định (bằng minFee) */
  maxFee: number | null;
}

export interface ServiceFeeSettings {
  travel: TravelPolicy;
  surcharges: ServiceSurcharge[];
}

export const DEFAULT_TRAVEL_POLICY: TravelPolicy = { freeKm: 5, perKm: 5000 };

export const DEFAULT_SURCHARGES: ServiceSurcharge[] = [
  { label: 'Lông dài, dày', minFee: 30000, maxFee: 80000 },
  { label: 'Gỡ lông rối', minFee: 50000, maxFee: 150000 },
  { label: 'Chăm sóc mèo cần thêm thời gian', minFee: 30000, maxFee: 70000 },
  { label: 'Phục vụ ngoài giờ', minFee: 50000, maxFee: null },
];

const toNonNegative = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return value !== undefined && value !== '' && Number.isFinite(n) && n >= 0 ? n : fallback;
};

/** Dựng cấu hình từ các dòng system_configs; dữ liệu hỏng/thiếu => dùng mặc định. */
export function parseFeeSettings(rows: { key: string; value: string }[]): ServiceFeeSettings {
  const get = (key: string) => rows.find((r) => r.key === key)?.value;

  let surcharges = DEFAULT_SURCHARGES;
  const raw = get(FEE_CONFIG_KEYS.surcharges);
  if (raw !== undefined) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        surcharges = parsed
          .filter((s) => s && typeof s.label === 'string' && Number.isFinite(Number(s.minFee)))
          .map((s) => ({
            label: String(s.label),
            minFee: Number(s.minFee),
            maxFee: s.maxFee === null || s.maxFee === undefined ? null : Number(s.maxFee),
          }));
      }
    } catch {
      // giữ mặc định
    }
  }

  return {
    travel: {
      freeKm: toNonNegative(get(FEE_CONFIG_KEYS.travelFreeKm), DEFAULT_TRAVEL_POLICY.freeKm),
      perKm: toNonNegative(get(FEE_CONFIG_KEYS.travelPerKm), DEFAULT_TRAVEL_POLICY.perKm),
    },
    surcharges,
  };
}

type ConfigClient = {
  system_configs: {
    findMany: (args: {
      where: { key: { in: string[] } };
    }) => Promise<{ key: string; value: string }[]>;
  };
};

export async function loadFeeSettings(client: ConfigClient): Promise<ServiceFeeSettings> {
  const rows = await client.system_configs.findMany({
    where: { key: { in: Object.values(FEE_CONFIG_KEYS) } },
  });
  return parseFeeSettings(rows);
}

/** Chính sách phí di chuyển dùng khi tính tiền. Lỗi đọc DB => mặc định (không chặn đặt lịch). */
export async function loadTravelPolicy(client: ConfigClient): Promise<TravelPolicy> {
  try {
    return (await loadFeeSettings(client)).travel;
  } catch {
    return DEFAULT_TRAVEL_POLICY;
  }
}
