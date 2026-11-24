'use client';

import * as React from 'react';
import { Car, Loader2, Plus, ReceiptText, Save, Trash2, Undo2 } from 'lucide-react';
import { servicesService } from '../services/services.service';
import type { ServiceFeeSettings } from '../types';
import { formatSurchargeFee } from '../utils/pricing-display';

type Row = { key: number; label: string; minFee: string; maxFee: string };

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';

const errorMessage = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const msg = e?.response?.data?.message;
  return (Array.isArray(msg) ? msg.join(', ') : msg) || e?.message || fallback;
};

let rowSeq = 0;
const toRows = (s: ServiceFeeSettings): Row[] =>
  s.surcharges.map((x) => ({
    key: ++rowSeq,
    label: x.label,
    minFee: String(x.minFee),
    maxFee: x.maxFee === null ? '' : String(x.maxFee),
  }));

/** Admin: phí di chuyển (hệ thống tự tính khi báo giá) và danh sách phụ phí hiển thị cho khách. */
export function AdminServiceFeesManager() {
  const [saved, setSaved] = React.useState<ServiceFeeSettings | null>(null);
  const [freeKm, setFreeKm] = React.useState('');
  const [perKm, setPerKm] = React.useState('');
  const [rows, setRows] = React.useState<Row[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);

  const reset = React.useCallback((s: ServiceFeeSettings) => {
    setSaved(s);
    setFreeKm(String(s.travel.freeKm));
    setPerKm(String(s.travel.perKm));
    setRows(toRows(s));
  }, []);

  React.useEffect(() => {
    servicesService
      .getServiceFees()
      .then(reset)
      .catch((err) => setError(errorMessage(err, 'Không tải được cấu hình phụ phí')));
  }, [reset]);

  const updateRow = (key: number, field: keyof Omit<Row, 'key'>, value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const isDirty =
    saved !== null &&
    (freeKm !== String(saved.travel.freeKm) ||
      perKm !== String(saved.travel.perKm) ||
      JSON.stringify(rows.map(({ label, minFee, maxFee }) => [label, minFee, maxFee])) !==
        JSON.stringify(toRows(saved).map(({ label, minFee, maxFee }) => [label, minFee, maxFee])));

  const handleSave = async () => {
    setError(null);
    const free = Number(freeKm);
    const rate = Number(perKm);
    if (!Number.isFinite(free) || free < 0) return setError('Số km miễn phí phải là số không âm.');
    if (!Number.isInteger(rate) || rate < 0) return setError('Phí mỗi km phải là số nguyên không âm.');

    const surcharges: ServiceFeeSettings['surcharges'] = [];
    for (const r of rows) {
      const label = r.label.trim();
      if (!label) return setError('Tên phụ phí không được để trống.');
      const min = Number(r.minFee);
      const max = r.maxFee.trim() === '' ? null : Number(r.maxFee);
      if (!Number.isInteger(min) || min < 0) return setError(`"${label}": mức thấp nhất phải là số nguyên không âm.`);
      if (max !== null && (!Number.isInteger(max) || max < min))
        return setError(`"${label}": mức cao nhất phải lớn hơn hoặc bằng mức thấp nhất.`);
      surcharges.push({ label, minFee: min, maxFee: max });
    }

    if (
      saved &&
      (free !== saved.travel.freeKm || rate !== saved.travel.perKm) &&
      !window.confirm(
        `Đổi phí di chuyển thành miễn phí ${free} km đầu, ${rate.toLocaleString('vi-VN')}đ/km vượt thêm?\n` +
          'Mức mới áp dụng ngay cho các đơn báo giá / đặt lịch từ bây giờ.',
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      reset(await servicesService.updateServiceFees({ travel: { freeKm: free, perKm: rate }, surcharges }));
      setFlash('Đã lưu phụ phí. Thay đổi được ghi vào nhật ký hệ thống.');
      setTimeout(() => setFlash(null), 4000);
    } catch (err) {
      setError(errorMessage(err, 'Lưu phụ phí thất bại'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm md:p-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <ReceiptText className="h-5 w-5 text-teal-600" />
            Phụ phí & phí di chuyển
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Hiển thị cho khách trên trang Dịch vụ. Phí di chuyển được hệ thống <strong>tự tính</strong> khi báo giá;
            các phụ phí khác chỉ để tham khảo và được thống nhất với khách trước khi thực hiện.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={() => saved && reset(saved)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" /> Hoàn tác
          </button>
          <button
            type="button"
            disabled={!isDirty || isSaving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-40"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Lưu thay đổi
          </button>
        </div>
      </div>

      {flash && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{flash}</div>}
      {error && <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {saved === null && !error ? (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Đang tải cấu hình...
        </div>
      ) : (
        <>
          {/* Phí di chuyển */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Car className="h-4 w-4" /> Phí di chuyển (áp dụng khi tính tiền)
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Miễn phí trong bán kính (km)</span>
                <input className={inputCls} type="number" min={0} step={0.5} value={freeKm} onChange={(e) => setFreeKm(e.target.value)} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-600">Phí mỗi km vượt thêm (VND)</span>
                <input className={inputCls} type="number" min={0} step={500} value={perKm} onChange={(e) => setPerKm(e.target.value)} />
              </label>
            </div>
          </div>

          {/* Phụ phí tham khảo */}
          <div className="space-y-3">
            <div className="hidden grid-cols-[1fr_140px_140px_40px] gap-3 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid">
              <span>Hạng mục phụ phí</span>
              <span>Từ (VND)</span>
              <span>Đến (VND)</span>
              <span />
            </div>
            {rows.map((r) => (
              <div key={r.key} className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-100 p-3 md:grid-cols-[1fr_140px_140px_40px] md:items-center md:gap-3 md:border-0 md:p-0">
                <input className={inputCls} value={r.label} maxLength={120} placeholder="VD: Gỡ lông rối" onChange={(e) => updateRow(r.key, 'label', e.target.value)} />
                <input className={inputCls} type="number" min={0} step={1000} value={r.minFee} placeholder="Mức thấp nhất" onChange={(e) => updateRow(r.key, 'minFee', e.target.value)} />
                <input className={inputCls} type="number" min={0} step={1000} value={r.maxFee} placeholder="Để trống = cố định" onChange={(e) => updateRow(r.key, 'maxFee', e.target.value)} />
                <button
                  type="button"
                  onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))}
                  className="flex h-9 w-9 items-center justify-center justify-self-end rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  aria-label={`Xoá phụ phí ${r.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              disabled={rows.length >= 20}
              onClick={() => setRows((rs) => [...rs, { key: ++rowSeq, label: '', minFee: '', maxFee: '' }])}
              className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:border-teal-500 hover:text-teal-700 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" /> Thêm phụ phí
            </button>
          </div>

          {/* Xem trước */}
          {rows.some((r) => r.label.trim()) && (
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Khách sẽ thấy</p>
              <ul className="mt-2 divide-y divide-slate-100 text-sm">
                {rows
                  .filter((r) => r.label.trim())
                  .map((r) => (
                    <li key={r.key} className="flex justify-between gap-4 py-2">
                      <span className="font-semibold text-slate-700">{r.label}</span>
                      <span className="font-bold tabular-nums text-slate-900">
                        {formatSurchargeFee({
                          minFee: Number(r.minFee) || 0,
                          maxFee: r.maxFee.trim() === '' ? null : Number(r.maxFee),
                        })}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
