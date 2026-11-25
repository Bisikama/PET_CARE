'use client';

import * as React from 'react';
import { Loader2, X } from 'lucide-react';
import type { AdminSubscriptionPlan, SubscriptionPlanInput } from '../types/subscription.types';

interface Props {
  /** null = tạo gói mới */
  plan: AdminSubscriptionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: SubscriptionPlanInput) => Promise<string | null>;
}

const CODE_RE = /^[A-Z0-9]{2,20}$/;
const inputCls =
  'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500';

export function SubscriptionPlanFormModal({ plan, isOpen, onClose, onSubmit }: Props) {
  const [form, setForm] = React.useState({
    code: '',
    name: '',
    description: '',
    price: '',
    durationDays: '30',
    benefits: '',
    isActive: true,
    sortOrder: '0',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setForm(
      plan
        ? {
            code: plan.code,
            name: plan.name,
            description: plan.description ?? '',
            price: String(plan.price),
            durationDays: String(plan.durationDays),
            benefits: plan.benefits.join('\n'),
            isActive: plan.isActive,
            sortOrder: String(plan.sortOrder),
          }
        : { code: '', name: '', description: '', price: '', durationDays: '30', benefits: '', isActive: true, sortOrder: '0' },
    );
  }, [isOpen, plan]);

  if (!isOpen) return null;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const code = form.code.trim().toUpperCase();
  const transferPreview = `PCXXXXXXXXXX Thanh toan goi thanh vien ${code || '<MÃ GÓI>'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    const durationDays = Number(form.durationDays);
    if (!plan && !CODE_RE.test(code)) return setError('Mã gói gồm 2-20 ký tự A-Z, 0-9 (không dấu, không khoảng trắng).');
    if (!form.name.trim()) return setError('Nhập tên gói.');
    if (!Number.isInteger(price) || price < 1000) return setError('Giá phải là số nguyên từ 1.000đ.');
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 3650)
      return setError('Thời hạn từ 1 đến 3650 ngày.');

    setSaving(true);
    setError(null);
    const err = await onSubmit({
      code: plan ? undefined : code,
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      durationDays,
      benefits: form.benefits.split('\n').map((b) => b.trim()).filter(Boolean),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    });
    setSaving(false);
    if (err) setError(err);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">{plan ? `Sửa gói ${plan.code}` : 'Tạo gói hội viên'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Đóng">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-bold text-slate-600">Mã gói</span>
            <input
              className={`${inputCls} font-mono uppercase disabled:bg-slate-50 disabled:text-slate-400`}
              value={form.code}
              onChange={set('code')}
              disabled={Boolean(plan)}
              placeholder="BASIC"
              maxLength={20}
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-slate-600">Thứ tự hiển thị</span>
            <input className={inputCls} type="number" min={0} value={form.sortOrder} onChange={set('sortOrder')} />
          </label>
        </div>
        <p className="text-[11px] text-slate-500 -mt-2">
          Nội dung CK của khách: <span className="font-mono text-slate-700">{transferPreview}</span>
          {plan && ' — mã gói không đổi được vì đã in trong nội dung CK của các đơn cũ.'}
        </p>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">Tên gói</span>
          <input className={inputCls} value={form.name} onChange={set('name')} maxLength={100} placeholder="Gói Cơ Bản" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-bold text-slate-600">Giá bán (VND)</span>
            <input className={inputCls} type="number" min={1000} step={1000} value={form.price} onChange={set('price')} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-slate-600">Thời hạn (ngày)</span>
            <input className={inputCls} type="number" min={1} max={3650} value={form.durationDays} onChange={set('durationDays')} />
          </label>
        </div>
        {plan && (
          <p className="text-[11px] text-amber-700 -mt-2">
            Giá và thời hạn mới chỉ áp dụng cho đơn tạo sau khi lưu; đơn đang chờ giữ giá cũ.
          </p>
        )}

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">Mô tả</span>
          <textarea className={inputCls} rows={2} value={form.description} onChange={set('description')} maxLength={500} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-600">Quyền lợi (mỗi dòng một ý)</span>
          <textarea className={inputCls} rows={3} value={form.benefits} onChange={set('benefits')} />
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="w-4 h-4 accent-teal-600"
          />
          Đang mở bán
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
            Huỷ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {plan ? 'Lưu thay đổi' : 'Tạo gói'}
          </button>
        </div>
      </form>
    </div>
  );
}
