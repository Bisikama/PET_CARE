import * as React from 'react';
import { AlertCircle, Car, Info, Package, RefreshCw, ShieldCheck } from 'lucide-react';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { ServicePackageCard } from './ServicePackageCard';
import { ServicePriceComparison } from './ServicePriceComparison';
import { ServiceDetailModal } from './ServiceDetailModal';
import { servicesService } from '../services/services.service';
import { formatSurchargeFee, formatVnd } from '../utils/pricing-display';
import type { ServiceFeeSettings } from '../types';

export const ServiceList: React.FC = () => {
  const { packages, isLoading, error, reload } = useServiceCatalog();
  const [fees, setFees] = React.useState<ServiceFeeSettings | null>(null);
  const [detailServiceId, setDetailServiceId] = React.useState<string | null>(null);

  React.useEffect(() => {
    servicesService.getServiceFees().then(setFees).catch(() => setFees(null));
  }, []);

  const allItems = React.useMemo(() => {
    const ordered = [...packages].sort((a, b) => b.included.length - a.included.length);
    const seen = new Set<string>();
    const result: string[] = [];
    ordered.forEach((p) =>
      p.included.forEach((t) => {
        if (!seen.has(t.title)) {
          seen.add(t.title);
          result.push(t.title);
        }
      }),
    );
    const count = (title: string) => packages.filter((p) => p.included.some((t) => t.title === title)).length;
    return result.sort((a, b) => count(b) - count(a));
  }, [packages]);

  const featuredId = React.useMemo(() => {
    if (packages.length < 2) return null;
    return [...packages].sort((a, b) => b.included.length - a.included.length || b.service.basePrice - a.service.basePrice)[0]
      .service.id;
  }, [packages]);

  if (error) {
    return (
      <div className="mx-auto my-12 flex max-w-2xl flex-col items-center space-y-4 rounded-3xl border border-rose-100 bg-rose-50/50 p-8 text-center">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">Không thể tải dịch vụ</h3>
          <p className="max-w-md text-sm text-slate-500">{error}</p>
        </div>
        <button
          onClick={reload}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-500"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-4 w-32 animate-pulse rounded-lg bg-slate-200" />
          <div className="mx-auto h-9 w-80 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-[500px] animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="mx-auto my-12 flex max-w-2xl flex-col items-center space-y-5 rounded-3xl border border-slate-200/70 bg-white p-12 text-center shadow-2xs">
        <div className="rounded-2xl bg-slate-100 p-4 text-[#08243D]">
          <Package className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-[#08243D]">Chưa có gói dịch vụ nào đang mở bán</h3>
          <p className="max-w-md text-xs leading-relaxed text-slate-500">
            Vui lòng quay lại sau khi PetCare cập nhật danh sách gói dịch vụ.
          </p>
        </div>
        <button
          onClick={reload}
          className="flex items-center gap-2 rounded-xl bg-[#08243D] px-5 py-2.5 text-xs font-bold text-[#F7C948]"
        >
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </button>
      </div>
    );
  }

  const gridCols =
    packages.length === 1
      ? 'md:grid-cols-1 max-w-md'
      : packages.length === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-10 animate-fade-in">
      {/* Clean Editorial Header */}
      <header className="space-y-2.5 text-center pt-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Gói chăm sóc tại nhà</p>
        <h2 className="text-3xl font-bold tracking-tight text-[#08243D] md:text-4xl">
          Chọn gói phù hợp cho bé cưng
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-500">
          Chuyên viên PetCare đến tận nhà với đầy đủ dụng cụ. Giá niêm yết rõ ràng theo cân nặng và được bảo vệ an toàn qua hệ thống Escrow.
        </p>
      </header>

      {/* Package Cards */}
      <div className={`mx-auto grid grid-cols-1 gap-6 ${gridCols}`}>
        {packages.map((pkg) => (
          <ServicePackageCard
            key={pkg.service.id}
            pkg={pkg}
            allItems={allItems}
            featured={pkg.service.id === featuredId}
            onViewDetail={(id) => setDetailServiceId(id)}
          />
        ))}
      </div>

      <ServiceDetailModal
        serviceId={detailServiceId}
        isOpen={!!detailServiceId}
        onClose={() => setDetailServiceId(null)}
      />

      {/* Price Table */}
      <ServicePriceComparison packages={packages} />

      {/* Surcharges & Escrow Note */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {fees && (
          <section className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-2xs md:col-span-3">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600">
              <Info className="h-3.5 w-3.5" />
              Phụ phí & Di chuyển
            </p>
            <dl className="mt-4 divide-y divide-slate-100">
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Car className="h-4 w-4 text-slate-400" />
                  Di chuyển trong bán kính {fees.travel.freeKm} km
                </dt>
                <dd className="text-sm font-bold text-emerald-600">Miễn phí</dd>
              </div>
              <div className="flex items-start justify-between gap-4 py-3">
                <dt className="pl-6 text-sm font-medium text-slate-700">Di chuyển ngoài {fees.travel.freeKm} km</dt>
                <dd className="text-right text-sm font-bold text-[#08243D]">{formatVnd(fees.travel.perKm)}/km</dd>
              </div>
              {fees.surcharges.map((s) => (
                <div key={s.label} className="flex items-start justify-between gap-4 py-3">
                  <dt className="pl-6 text-sm font-medium text-slate-700">{s.label}</dt>
                  <dd className="text-right text-sm font-bold tabular-nums text-[#08243D]">{formatSurchargeFee(s)}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section
          className={`flex flex-col justify-between rounded-3xl bg-[#08243D] p-7 text-white shadow-sm ${
            fees ? 'md:col-span-2' : 'md:col-span-5'
          }`}
        >
          <div className="space-y-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#F7C948]/15 text-[#F7C948]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold tracking-tight">Thanh toán Escrow an toàn</h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              Tiền thanh toán được hệ thống giữ an toàn và chỉ chuyển cho chuyên viên sau khi bạn xác nhận nghiệm thu hoàn tất.
            </p>
          </div>
          <p className="mt-6 text-xs font-semibold text-[#F7C948]">VietQR · VNPay · Ví PetCare</p>
        </section>
      </div>
    </div>
  );
};


