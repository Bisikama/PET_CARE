import { useCallback, useEffect, useState } from 'react';
import { servicesService } from '../services/services.service';
import { activeRules } from '../utils/pricing-display';
import type { ChecklistTemplate, PricingRule, Service } from '../types';

export interface CatalogPackage {
  service: Service;
  /** Hạng mục bao gồm trong gói (theo thứ tự) */
  included: ChecklistTemplate[];
  /** Bảng giá đang áp dụng */
  rules: PricingRule[];
}

/** Các gói dịch vụ đang mở bán kèm hạng mục bao gồm và bảng giá — dùng cho trang khách hàng. */
export function useServiceCatalog() {
  const [packages, setPackages] = useState<CatalogPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await servicesService.getServices();
      const active = (all || [])
        .filter((s) => s.isActive && !s.deletedAt)
        .sort((a, b) => a.basePrice - b.basePrice);

      const detailed = await Promise.all(
        active.map(async (service) => {
          const [templates, rules] = await Promise.all([
            servicesService.getChecklistTemplates(service.id).catch(() => [] as ChecklistTemplate[]),
            servicesService.getPricingRules(service.id).catch(() => [] as PricingRule[]),
          ]);
          return {
            service,
            included: (templates || [])
              .filter((t) => !t.deletedAt)
              .sort((a, b) => a.sortOrder - b.sortOrder),
            rules: activeRules(rules || []),
          };
        }),
      );
      setPackages(detailed);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message || e?.message || 'Không thể tải danh sách gói dịch vụ.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { packages, isLoading, error, reload: load };
}
