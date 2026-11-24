'use client';

import * as React from 'react';
import { Info, Loader2 } from 'lucide-react';
import { servicesService } from '../services/services.service';
import type { PricingRule } from '../types';
import { formatVnd, weightBandLabel } from '../utils/pricing-display';

interface SystemPriceTableProps {
  serviceId: string;
  petSpecies: string;
  /** Giá gốc của gói — áp dụng khi gói chưa có bảng giá theo cân nặng */
  fallbackPrice?: number;
}

const formatPrice = formatVnd;
const weightLabel = (rule: PricingRule) => weightBandLabel(rule.minWeight, rule.maxWeight);

/**
 * Bảng giá do PetCare niêm yết (chỉ xem) — đối tác không tự đặt giá cho gói có bảng giá.
 * Gói chưa có bảng giá thì hiển thị giá gốc áp dụng cho đơn.
 */
export function SystemPriceTable({ serviceId, petSpecies, fallbackPrice }: SystemPriceTableProps) {
  const [rules, setRules] = React.useState<PricingRule[] | null>(null);

  React.useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    setRules(null);
    servicesService
      .getPricingRules(serviceId)
      .then((list) => !cancelled && setRules((list || []).filter((r) => r.isActive && !r.deletedAt)))
      .catch(() => !cancelled && setRules([]));
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  if (!serviceId) return null;

  if (rules === null) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải bảng giá...
      </div>
    );
  }

  const speciesRules = rules
    .filter((r) => r.petSpecies.toLowerCase() === petSpecies.toLowerCase())
    .sort((a, b) => (a.minWeight ?? 0) - (b.minWeight ?? 0));
  const speciesLabel = petSpecies === 'Cat' ? 'mèo' : 'chó';

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          {rules.length > 0 ? (
            <>
              <strong>Giá do PetCare niêm yết theo cân nặng</strong> — bạn không cần nhập giá. Khách thanh toán theo
              bảng dưới đây (chưa gồm phí di chuyển).
            </>
          ) : (
            <>
              Gói này chưa có bảng giá theo cân nặng. Đơn sẽ áp dụng giá gốc
              {fallbackPrice !== undefined ? <strong> {formatPrice(fallbackPrice)}</strong> : null}.
            </>
          )}
        </p>
      </div>

      {rules.length > 0 &&
        (speciesRules.length > 0 ? (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                <th className="text-left font-bold pb-1">Cân nặng ({speciesLabel})</th>
                <th className="text-right font-bold pb-1">Giá</th>
                <th className="text-right font-bold pb-1">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {speciesRules.map((r) => (
                <tr key={r.id}>
                  <td className="py-1.5 font-semibold text-slate-700">{weightLabel(r)}</td>
                  <td className="py-1.5 text-right font-bold text-slate-800 tabular-nums">{formatPrice(r.price)}</td>
                  <td className="py-1.5 text-right text-slate-500">{r.durationMinutes} phút</td>
                </tr>
              ))}
              <tr>
                <td className="py-1.5 font-semibold text-slate-500">Ngoài các mức trên</td>
                <td colSpan={2} className="py-1.5 text-right text-slate-500">
                  Báo giá riêng
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-xs font-semibold text-amber-700">
            Gói này chưa có giá niêm yết cho {speciesLabel} — khách sẽ không đặt online được.
          </p>
        ))}
    </div>
  );
}
