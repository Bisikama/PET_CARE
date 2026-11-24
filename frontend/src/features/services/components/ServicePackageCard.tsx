'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Clock, Minus, Sparkles } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import type { CatalogPackage } from '../hooks/useServiceCatalog';
import { formatVnd, maxPricedWeight } from '../utils/pricing-display';

interface ServicePackageCardProps {
  pkg: CatalogPackage;
  /** Tất cả hạng mục của mọi gói — để hiện cả hạng mục gói này KHÔNG có (so sánh nhanh) */
  allItems: string[];
  featured?: boolean;
}

/** Thẻ gói dịch vụ cho khách: giá khởi điểm, thời gian, hạng mục bao gồm. */
export function ServicePackageCard({ pkg, allItems, featured = false }: ServicePackageCardProps) {
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
      className={`relative flex flex-col rounded-[28px] p-7 md:p-8 transition-all duration-300 hover:-translate-y-1 ${
        featured
          ? 'bg-gradient-to-b from-[#0a1d33] to-[#031625] text-white shadow-2xl shadow-slate-900/20 ring-1 ring-[#f0c05a]/30'
          : 'bg-white text-slate-800 border border-slate-200/80 shadow-sm hover:shadow-xl'
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-[#f0c05a] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-950 shadow-md">
          <Sparkles className="h-3.5 w-3.5" />
          Chăm sóc toàn diện
        </span>
      )}

      <header className="space-y-2">
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.18em] ${
            featured ? 'text-[#f0c05a]' : 'text-teal-600'
          }`}
        >
          Gói dịch vụ
        </p>
        <h3 className="text-2xl font-black tracking-tight">{service.name}</h3>
        {service.description && (
          <p className={`text-sm leading-relaxed line-clamp-2 ${featured ? 'text-slate-300' : 'text-slate-500'}`}>
            {service.description}
          </p>
        )}
      </header>

      <div className={`mt-6 pb-6 border-b ${featured ? 'border-white/10' : 'border-slate-100'}`}>
        <p className={`text-xs font-semibold ${featured ? 'text-slate-400' : 'text-slate-400'}`}>Chỉ từ</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className={`text-4xl font-black tracking-tight tabular-nums ${featured ? 'text-white' : 'text-slate-900'}`}>
            {formatVnd(fromPrice)}
          </span>
          <span className={`text-sm font-medium ${featured ? 'text-slate-400' : 'text-slate-400'}`}>/ lần</span>
        </p>
        <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold ${featured ? 'text-slate-300' : 'text-slate-500'}`}>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {minDuration === maxDuration ? `${maxDuration} phút` : `${minDuration} – ${maxDuration} phút`}
          </span>
          {maxWeight !== null && <span>Thú cưng đến {maxWeight} kg</span>}
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
                      ? 'bg-[#f0c05a] text-slate-950'
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
                      ? 'font-semibold text-slate-100'
                      : 'font-semibold text-slate-700'
                    : featured
                      ? 'text-slate-500 line-through decoration-slate-600'
                      : 'text-slate-400 line-through decoration-slate-300'
                }
              >
                {title}
              </span>
            </li>
          );
        })}
      </ul>

      <Link
        href={`${ROUTES.BOOKINGS}?serviceId=${encodeURIComponent(service.id)}`}
        className={`mt-8 inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
          featured
            ? 'bg-[#f0c05a] text-slate-950 hover:bg-[#e0b04a]'
            : 'bg-[#0a1128] text-white hover:bg-slate-800'
        }`}
      >
        Đặt lịch {service.name}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
