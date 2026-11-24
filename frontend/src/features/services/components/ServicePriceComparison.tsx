'use client';

import * as React from 'react';
import { Scale } from 'lucide-react';
import type { CatalogPackage } from '../hooks/useServiceCatalog';
import { formatVnd, maxPricedWeight, weightBandLabel } from '../utils/pricing-display';

const SPECIES = [
  { key: 'Dog', label: 'Chó' },
  { key: 'Cat', label: 'Mèo' },
] as const;

type Band = { min: number | null; max: number | null };
const bandKey = (b: Band) => `${b.min ?? 0}-${b.max ?? '∞'}`;

/** Bảng giá theo cân nặng, mỗi cột một gói. */
export function ServicePriceComparison({ packages }: { packages: CatalogPackage[] }) {
  const priced = packages.filter((p) => p.rules.length > 0);
  const [species, setSpecies] = React.useState<'Dog' | 'Cat'>('Dog');

  const allRules = priced.flatMap((p) => p.rules);
  // Chó/mèo cùng giá => không cần nút chuyển loài
  const samePriceForBoth = priced.every((p) =>
    p.rules
      .filter((r) => r.petSpecies === 'Dog')
      .every((dog) =>
        p.rules.some(
          (cat) =>
            cat.petSpecies === 'Cat' &&
            cat.minWeight === dog.minWeight &&
            cat.maxWeight === dog.maxWeight &&
            cat.price === dog.price,
        ),
      ),
  );
  const hasSpecies = (key: string) => allRules.some((r) => r.petSpecies === key);
  const activeSpecies = hasSpecies(species) ? species : hasSpecies('Dog') ? 'Dog' : 'Cat';

  const bands = React.useMemo(() => {
    const map = new Map<string, Band>();
    allRules
      .filter((r) => r.petSpecies === activeSpecies)
      .forEach((r) => map.set(bandKey({ min: r.minWeight, max: r.maxWeight }), { min: r.minWeight, max: r.maxWeight }));
    return [...map.values()].sort((a, b) => (a.min ?? 0) - (b.min ?? 0));
  }, [allRules, activeSpecies]);

  if (priced.length === 0) return null;

  const ceiling = maxPricedWeight(allRules.filter((r) => r.petSpecies === activeSpecies));
  const priceFor = (pkg: CatalogPackage, band: Band) =>
    pkg.rules.find(
      (r) => r.petSpecies === activeSpecies && r.minWeight === band.min && r.maxWeight === band.max,
    )?.price;

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col gap-4 px-7 pt-7 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-600">
            <Scale className="h-3.5 w-3.5" />
            Bảng giá theo cân nặng
          </p>
          <h3 className="text-xl font-black tracking-tight text-slate-900">Giá niêm yết cho mỗi lần chăm sóc</h3>
          <p className="text-sm text-slate-500">
            Đơn vị: VNĐ / lần.{' '}
            {samePriceForBoth ? 'Áp dụng như nhau cho chó và mèo.' : 'Chọn loài để xem giá tương ứng.'} Chưa gồm phí
            di chuyển.
          </p>
        </div>

        {!samePriceForBoth && (
          <div className="inline-flex rounded-2xl bg-slate-100 p-1" role="tablist" aria-label="Chọn loài thú cưng">
            {SPECIES.filter((s) => hasSpecies(s.key)).map((s) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={activeSpecies === s.key}
                onClick={() => setSpecies(s.key)}
                className={`rounded-xl px-5 py-2 text-sm font-bold transition-all ${
                  activeSpecies === s.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/80">
              <th scope="col" className="px-7 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cân nặng
              </th>
              {priced.map((p) => (
                <th key={p.service.id} scope="col" className="px-7 py-3.5 text-right text-sm font-black text-slate-800">
                  {p.service.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bands.map((band) => (
              <tr key={bandKey(band)} className="transition-colors hover:bg-teal-50/40">
                <th scope="row" className="px-7 py-4 text-left font-semibold text-slate-700">
                  {weightBandLabel(band.min, band.max)}
                </th>
                {priced.map((p) => {
                  const price = priceFor(p, band);
                  return (
                    <td key={p.service.id} className="px-7 py-4 text-right font-bold tabular-nums text-slate-900">
                      {price !== undefined ? formatVnd(price) : <span className="font-medium text-slate-300">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            {ceiling !== null && (
              <tr className="bg-amber-50/40">
                <th scope="row" className="px-7 py-4 text-left font-semibold text-slate-700">
                  Trên {ceiling} kg
                </th>
                <td colSpan={priced.length} className="px-7 py-4 text-right font-semibold text-amber-700">
                  Liên hệ để được báo giá riêng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
