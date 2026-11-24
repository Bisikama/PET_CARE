import * as React from 'react';
import { AlertCircle, Car, Info, Package, RefreshCw, ShieldCheck } from 'lucide-react';
import { useServiceCatalog } from '../hooks/useServiceCatalog';
import { ServicePackageCard } from './ServicePackageCard';
import { ServicePriceComparison } from './ServicePriceComparison';
import { servicesService } from '../services/services.service';
import { formatSurchargeFee, formatVnd } from '../utils/pricing-display';
import type { ServiceFeeSettings } from '../types';

/** Trang "Dịch vụ thú cưng" của khách: chỉ các gói đang mở bán, so sánh hạng mục và bảng giá. */
export const ServiceList: React.FC = () => {
  const { packages, isLoading, error, reload } = useServiceCatalog();
  const [fees, setFees] = React.useState<ServiceFeeSettings | null>(null);

  React.useEffect(() => {
    servicesService.getServiceFees().then(setFees).catch(() => setFees(null));
  }, []);

  // Hạng mục của mọi gói (theo thứ tự của gói đầy đủ nhất) — để so sánh có / không
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
    // Hạng mục cơ bản (có ở nhiều gói) lên trước
    const count = (title: string) => packages.filter((p) => p.included.some((t) => t.title === title)).length;
    return result.sort((a, b) => count(b) - count(a));
  }, [packages]);

  // Gói nhiều hạng mục nhất được làm nổi bật (khi có từ 2 gói)
  const featuredId = React.useMemo(() => {
    if (packages.length < 2) return null;
    return [...packages].sort((a, b) => b.included.length - a.included.length || b.service.basePrice - a.service.basePrice)[0]
      .service.id;
  }, [packages]);

  if (error) {
    return (
      <div className="mx-auto my-12 flex max-w-2xl flex-col items-center space-y-4 rounded-[32px] border border-rose-100 bg-rose-50/50 p-8 text-center">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-rose-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">Không thể tải dịch vụ</h3>
          <p className="max-w-md text-sm text-slate-500">{error}</p>
        </div>
        <button
          onClick={reload}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 active:scale-95"
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
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-9 w-80 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-96 animate-pulse rounded-lg bg-slate-200" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-[520px] animate-pulse rounded-[28px] bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="mx-auto my-12 flex max-w-2xl flex-col items-center space-y-6 rounded-[32px] border border-slate-100 bg-white p-12 text-center shadow-sm">
        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-5 text-teal-600">
          <Package className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">Chưa có gói dịch vụ nào đang mở bán</h3>
          <p className="max-w-md text-sm leading-relaxed text-slate-400">
            Vui lòng quay lại sau khi PetCare cập nhật danh sách gói dịch vụ.
          </p>
        </div>
        <button
          onClick={reload}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-500 active:scale-95"
        >
          <RefreshCw className="h-4 w-4" />
          Tải lại
        </button>
      </div>
    );
  }

  const gridCols = packages.length === 1 ? 'md:grid-cols-1 max-w-md' : packages.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-8">
      {/* Tiêu đề */}
      <header className="space-y-3 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-teal-600">Gói chăm sóc tại nhà</p>
        <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Chọn gói phù hợp cho bé cưng</h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-500">
          Chuyên viên PetCare đến tận nhà với đầy đủ dụng cụ. Giá niêm yết rõ ràng theo cân nặng, thanh toán trước và
          được giữ an toàn cho tới khi dịch vụ hoàn tất.
        </p>
      </header>

      {/* Thẻ gói */}
      <div className={`mx-auto grid grid-cols-1 gap-6 pt-3 ${gridCols}`}>
        {packages.map((pkg) => (
          <ServicePackageCard
            key={pkg.service.id}
            pkg={pkg}
            allItems={allItems}
            featured={pkg.service.id === featuredId}
          />
        ))}
      </div>

      {/* Bảng giá */}
      <ServicePriceComparison packages={packages} />

      {/* Phụ phí & cam kết */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        {fees && (
        <section className="rounded-[28px] border border-slate-200/80 bg-white p-7 shadow-sm md:col-span-3">
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-600">
            <Info className="h-3.5 w-3.5" />
            Phụ phí có thể phát sinh
          </p>
          <dl className="mt-4 divide-y divide-slate-100">
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Car className="h-4 w-4 text-slate-400" />
                Di chuyển trong bán kính {fees.travel.freeKm} km
              </dt>
              <dd className="text-sm font-bold text-emerald-600">Miễn phí</dd>
            </div>
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="pl-6 text-sm font-semibold text-slate-700">Di chuyển ngoài {fees.travel.freeKm} km</dt>
              <dd className="text-right text-sm font-bold text-slate-900">{formatVnd(fees.travel.perKm)}/km vượt thêm</dd>
            </div>
            {fees.surcharges.map((s) => (
              <div key={s.label} className="flex items-start justify-between gap-4 py-3">
                <dt className="pl-6 text-sm font-semibold text-slate-700">{s.label}</dt>
                <dd className="text-right text-sm font-bold tabular-nums text-slate-900">{formatSurchargeFee(s)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
            Phí di chuyển được tính tự động khi báo giá. Các phụ phí khác chỉ áp dụng khi cần và luôn được thống nhất với
            bạn trước khi thực hiện.
          </p>
        </section>
        )}

        <section className={`flex flex-col justify-between rounded-[28px] bg-gradient-to-br from-[#0a1d33] to-[#031625] p-7 text-white shadow-xl ${fees ? 'md:col-span-2' : 'md:col-span-5'}`}>
          <div className="space-y-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0c05a]/15 text-[#f0c05a]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-black tracking-tight">Thanh toán an toàn</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Tiền của bạn được PetCare giữ lại và chỉ chuyển cho chuyên viên sau khi bạn xác nhận dịch vụ hoàn tất. Đơn
              bị huỷ hoặc không thực hiện sẽ được hoàn vào Ví PetCare.
            </p>
          </div>
          <p className="mt-6 text-xs font-semibold text-[#f0c05a]">Chuyển khoản VietQR · VNPay · Ví PetCare</p>
        </section>
      </div>
    </div>
  );
};
