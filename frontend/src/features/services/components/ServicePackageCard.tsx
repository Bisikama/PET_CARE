'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Clock, Minus, Sparkles } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import type { CatalogPackage } from '../hooks/useServiceCatalog';
import { formatVnd, maxPricedWeight } from '../utils/pricing-display';

interface ServicePackageCardProps {
  pkg: CatalogPackage;
  allItems: string[];
  featured?: boolean;
  onViewDetail?: (serviceId: string) => void;
}

export function ServicePackageCard({ pkg, allItems, featured = false, onViewDetail }: ServicePackageCardProps) {
  const { service, included, rules } = pkg;
  const includedTitles = new Set(included.map((t) => t.title));
  const fromPrice = rules.length > 0 ? Math.min(...rules.map((r) => r.price)) : service.basePrice;
  const durations = rules.length > 0 ? rules.map((r) => r.durationMinutes) : [service.durationMinutes];
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const maxWeight = rules.length > 0 ? maxPricedWeight(rules) : null;
  const items = allItems.length > 0 ? allItems : included.map((t) => t.title);

  return (
    <article
      className={`card-hover-lift relative flex flex-col rounded-3xl p-8 transition-all ${
        featured
          ? 'bg-[#08243D] text-white shadow-xl ring-1 ring-[#F7C948]/30'
          : 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs'
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-[#F7C948] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#08243D] shadow-xs">
          <Sparkles className="h-3 w-3" />
          Chăm sóc toàn diện
        </span>
      )}

      <header className="space-y-2">
        <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${featured ? 'text-[#F7C948]' : 'text-teal-600'}`}>
          Gói dịch vụ
        </p>
        <h3 className="text-2xl font-bold tracking-tight">{service.name}</h3>
        {service.description && (
          <p className={`text-sm leading-relaxed line-clamp-2 ${featured ? 'text-slate-300' : 'text-slate-500'}`}>
            {service.description}
          </p>
        )}
      </header>

      <div className={`mt-6 pb-6 border-b ${featured ? 'border-white/10' : 'border-slate-100'}`}>
        <p className="text-xs font-medium text-slate-400">Chỉ từ</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className={`text-4xl font-bold tracking-tight tabular-nums ${featured ? 'text-white' : 'text-[#08243D]'}`}>
            {formatVnd(fromPrice)}
          </span>
          <span className="text-sm font-medium text-slate-400">/ lần</span>
        </p>
        <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium ${featured ? 'text-slate-300' : 'text-slate-500'}`}>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {minDuration === maxDuration ? `${maxDuration} phút` : `${minDuration} – ${maxDuration} phút`}
          </span>
          {maxWeight !== null && <span>· Thú cưng đến {maxWeight} kg</span>}
        </div>
      </div>

      <ul className="mt-6 space-y-3 flex-1" aria-label={`Hạng mục của gói ${service.name}`}>
        {items.map((title) => {
          const has = includedTitles.has(title);
          return (
            <li key={title} className="flex items-start gap-3 text-sm">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  has
                    ? featured
                      ? 'bg-[#F7C948] text-[#08243D]'
                      : 'bg-teal-600 text-white'
                    : featured
                      ? 'bg-white/5 text-slate-500'
                      : 'bg-slate-100 text-slate-300'
                }`}
              >
                {has ? <Check className="h-3 w-3" strokeWidth={3} /> : <Minus className="h-3 w-3" />}
              </span>
              <span
                className={
                  has
                    ? featured
                      ? 'font-medium text-slate-100'
                      : 'font-medium text-slate-700'
                    : 'text-slate-400 line-through'
                }
              >
                {title}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 space-y-2.5">
        <Link
          href={`${ROUTES.BOOKINGS}?serviceId=${encodeURIComponent(service.id)}`}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors ${
            featured
              ? 'bg-[#F7C948] text-[#08243D] hover:bg-[#e5b83b]'
              : 'bg-[#08243D] text-white hover:bg-[#0c3254]'
          }`}
        >
          Đặt lịch {service.name}
          <ArrowRight className="h-4 w-4" />
        </Link>

        {onViewDetail && (
          <button
            type="button"
            onClick={() => onViewDetail(service.id)}
            className={`w-full py-2 text-xs font-semibold transition-colors cursor-pointer ${
              featured
                ? 'text-slate-300 hover:text-[#F7C948]'
                : 'text-slate-500 hover:text-[#08243D]'
            }`}
          >
            Xem chi tiết quy trình & bảng giá
          </button>
        )}
      </div>
    </article>
  );
}


