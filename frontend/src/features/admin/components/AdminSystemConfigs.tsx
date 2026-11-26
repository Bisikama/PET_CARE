'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Coins,
  Landmark,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Settings,
  SlidersHorizontal,
} from 'lucide-react';
import { adminService, type SystemConfigItem } from '../services/admin.service';
import { systemConfirm } from '@/components/ui/SystemDialogProvider';
import { getApiErrorMessage } from '@/lib/api-error';

const DEFAULT_COMMISSION_PERCENT = 15;
const SAMPLE_BOOKING_AMOUNT = 500_000;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDateTime = (val?: string) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function AdminSystemConfigs() {
  const [configs, setConfigs] = React.useState<SystemConfigItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingMain, setSavingMain] = React.useState(false);
  const [savingTable, setSavingTable] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [flash, setFlash] = React.useState<string | null>(null);

  // Structured financial config form state
  const [commissionPercentInput, setCommissionPercentInput] = React.useState(
    String(DEFAULT_COMMISSION_PERCENT),
  );
  const [adminWalletUserIdInput, setAdminWalletUserIdInput] = React.useState('');

  // Editable map for all rows in system_configs
  const [draftValues, setDraftValues] = React.useState<Record<string, string>>({});

  // Inline new config row
  const [newKey, setNewKey] = React.useState('');
  const [newValue, setNewValue] = React.useState('');

  const applyConfigState = React.useCallback((items: SystemConfigItem[]) => {
    setConfigs(items);
    const map: Record<string, string> = {};
    for (const item of items) {
      map[item.key] = item.value;
    }
    setDraftValues(map);

    const rateRaw = map['COMMISSION_RATE'];
    const parsedRate = rateRaw !== undefined ? parseFloat(rateRaw) : NaN;
    if (!isNaN(parsedRate) && parsedRate >= 0 && parsedRate <= 1) {
      setCommissionPercentInput(String(Number((parsedRate * 100).toFixed(2))));
    } else {
      setCommissionPercentInput(String(DEFAULT_COMMISSION_PERCENT));
    }

    setAdminWalletUserIdInput(map['ADMIN_WALLET_USER_ID'] ?? '');
  }, []);

  const fetchConfigs = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await adminService.getConfigs();
      applyConfigState(Array.isArray(items) ? items : []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải cấu hình hệ thống.'));
    } finally {
      setLoading(false);
    }
  }, [applyConfigState]);

  React.useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const showFlash = (message: string) => {
    setFlash(message);
    setTimeout(() => setFlash(null), 4500);
  };

  const parsedCommissionPercent = Number(commissionPercentInput);
  const isCommissionValid =
    Number.isFinite(parsedCommissionPercent) &&
    parsedCommissionPercent >= 0 &&
    parsedCommissionPercent <= 50;
  const previewRate = isCommissionValid ? parsedCommissionPercent / 100 : DEFAULT_COMMISSION_PERCENT / 100;
  const previewPlatformFee = Math.round(SAMPLE_BOOKING_AMOUNT * previewRate);
  const previewProviderAmount = SAMPLE_BOOKING_AMOUNT - previewPlatformFee;

  const handleSaveFinancialConfigs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingMain) return;
    setError(null);

    if (!isCommissionValid) {
      setError('Tỷ lệ hoa hồng phải nằm trong khoảng 0% đến 50%.');
      return;
    }

    const decimalRate = String(Number((parsedCommissionPercent / 100).toFixed(4)));
    const payload: { key: string; value: string }[] = [
      { key: 'COMMISSION_RATE', value: decimalRate },
    ];

    const trimmedWalletUserId = adminWalletUserIdInput.trim();
    if (trimmedWalletUserId) {
      payload.push({ key: 'ADMIN_WALLET_USER_ID', value: trimmedWalletUserId });
    }

    const ok = await systemConfirm({
      title: 'Xác nhận cập nhật cấu hình tài chính',
      message:
        `Áp dụng mức hoa hồng nền tảng mới là ${parsedCommissionPercent}% (COMMISSION_RATE = ${decimalRate})?` +
        (trimmedWalletUserId ? `\nVí Admin nhận hoa hồng: ${trimmedWalletUserId}` : '') +
        '\n\nThay đổi có hiệu lực ngay lập tức cho các đơn thanh toán mới và được ghi nhận vào Audit Logs.',
      confirmText: 'Lưu cấu hình',
      cancelText: 'Hủy bỏ',
      variant: 'warning',
    });
    if (!ok) return;

    setSavingMain(true);
    try {
      await adminService.updateConfigs(payload);
      await fetchConfigs();
      showFlash('Đã lưu cấu hình hoa hồng & ví sàn thành công.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Cập nhật cấu hình tài chính thất bại.'));
    } finally {
      setSavingMain(false);
    }
  };

  const modifiedRows = React.useMemo(
    () =>
      configs.filter((item) => {
        const draft = draftValues[item.key];
        return draft !== undefined && draft !== item.value;
      }),
    [configs, draftValues],
  );

  const handleSaveModifiedRows = async () => {
    if (savingTable || modifiedRows.length === 0) return;
    setError(null);

    const payload = modifiedRows.map((item) => ({
      key: item.key,
      value: (draftValues[item.key] ?? '').trim(),
    }));

    if (payload.some((p) => !p.value)) {
      setError('Giá trị cấu hình không được để trống.');
      return;
    }

    const ok = await systemConfirm({
      title: 'Xác nhận lưu tham số hệ thống',
      message: `Bạn sắp cập nhật ${payload.length} tham số cấu hình hệ thống. Thay đổi sẽ được ghi vết vào Audit Logs.`,
      confirmText: 'Xác nhận lưu',
      cancelText: 'Hủy',
      variant: 'warning',
    });
    if (!ok) return;

    setSavingTable(true);
    try {
      await adminService.updateConfigs(payload);
      await fetchConfigs();
      showFlash(`Đã cập nhật ${payload.length} tham số cấu hình.`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể lưu các thay đổi cấu hình.'));
    } finally {
      setSavingTable(false);
    }
  };

  const handleAddConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingTable) return;
    setError(null);

    const normalizedKey = newKey.trim().toUpperCase();
    const trimmedVal = newValue.trim();

    if (!normalizedKey || !/^[A-Z0-9_]+$/.test(normalizedKey)) {
      setError('Key cấu hình chỉ được gồm chữ in hoa, số và dấu gạch dưới (ví dụ: MAX_BOOKING_DAYS).');
      return;
    }
    if (!trimmedVal) {
      setError('Giá trị cấu hình mới không được để trống.');
      return;
    }

    setSavingTable(true);
    try {
      await adminService.updateConfigs([{ key: normalizedKey, value: trimmedVal }]);
      setNewKey('');
      setNewValue('');
      await fetchConfigs();
      showFlash(`Đã thêm/cập nhật tham số ${normalizedKey}.`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể thêm tham số cấu hình mới.'));
    } finally {
      setSavingTable(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#08243D] tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600" />
            Cấu Hình Hệ Thống (System Configs)
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Điều chỉnh tỷ lệ hoa hồng nền tảng và các tham số vận hành toàn cục. Mọi thay đổi có hiệu lực ngay và được ghi vào Audit Logs.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchConfigs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#08243D] hover:bg-[#0d3254] text-white text-xs font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Tải lại cấu hình
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {flash && (
        <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {flash}
        </div>
      )}

      {/* Card 1: Financial & Commission Structured Config */}
      <form
        onSubmit={handleSaveFinancialConfigs}
        className="bg-white rounded-3xl border border-slate-200/70 shadow-sm p-6 md:p-7 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <h4 className="text-base font-bold text-[#08243D] flex items-center gap-2">
              <Coins className="w-4.5 h-4.5 text-[#F7C948]" />
              Cấu Hình Tài Chính &amp; Hoa Hồng Sàn
            </h4>
            <p className="text-xs text-slate-400">
              Hệ thống ưu tiên giá trị trong DB (`system_configs`) trước khi fallback về `.env` và mặc định 15%.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="commission-percent-input" className="block text-xs font-bold text-[#08243D]">
              Tỷ lệ hoa hồng nền tảng (%) — <code className="font-mono text-teal-700">COMMISSION_RATE</code>
            </label>
            <div className="relative">
              <input
                id="commission-percent-input"
                type="number"
                min={0}
                max={50}
                step={0.5}
                value={commissionPercentInput}
                onChange={(e) => setCommissionPercentInput(e.target.value)}
                disabled={loading || savingMain}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white px-4 py-3 pr-12 text-sm font-black text-[#08243D] outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Nhập phần trăm từ 0% đến 50%. Hệ thống tự chuyển sang dạng thập phân khi lưu (ví dụ 15% → 0.15).
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-wallet-user-id" className="block text-xs font-bold text-[#08243D]">
              ID Tài khoản Ví Sàn (tùy chọn) — <code className="font-mono text-teal-700">ADMIN_WALLET_USER_ID</code>
            </label>
            <div className="relative">
              <Landmark className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-wallet-user-id"
                type="text"
                value={adminWalletUserIdInput}
                onChange={(e) => setAdminWalletUserIdInput(e.target.value)}
                disabled={loading || savingMain}
                placeholder="Để trống nếu dùng tài khoản Admin mặc định đầu tiên"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white pl-10 pr-4 py-3 text-xs font-mono font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              UUID của user ADMIN nhận tiền hoa hồng từ mỗi đơn hàng hoàn tất.
            </p>
          </div>
        </div>

        {/* Live Commission Preview */}
        <div className="bg-[#08243D] text-white rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F7C948]">
              Mô phỏng đơn {formatCurrency(SAMPLE_BOOKING_AMOUNT)}
            </span>
            <p className="text-xs text-slate-300">
              Tỷ lệ đang cấu hình:{' '}
              <strong className="text-white">
                {isCommissionValid ? `${parsedCommissionPercent}%` : 'Không hợp lệ'}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="bg-white/10 border border-white/10 rounded-xl px-3.5 py-2">
              <span className="block text-[10px] text-slate-300">Sàn thu (Hoa hồng)</span>
              <strong className="text-sm font-black text-[#F7C948]">
                {formatCurrency(previewPlatformFee)}
              </strong>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-xl px-3.5 py-2">
              <span className="block text-[10px] text-slate-300">Đối tác nhận</span>
              <strong className="text-sm font-black text-emerald-400">
                {formatCurrency(previewProviderAmount)}
              </strong>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || savingMain || !isCommissionValid}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {savingMain ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Lưu Cấu Hình Tài Chính
          </button>
        </div>
      </form>

      {/* Card 2: Advanced Key-Value Config Table */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4.5 h-4.5 text-[#08243D]" />
            <div>
              <h4 className="text-sm font-bold text-[#08243D]">
                Danh Sách Tham Số Hệ Thống ({configs.length})
              </h4>
              <p className="text-[11px] text-slate-400">
                Chỉnh sửa trực tiếp các key trong bảng `system_configs` hoặc thêm tham số mới.
              </p>
            </div>
          </div>

          {modifiedRows.length > 0 && (
            <button
              type="button"
              onClick={handleSaveModifiedRows}
              disabled={savingTable}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7C948] hover:bg-[#eab327] text-[#08243D] text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              {savingTable ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Lưu {modifiedRows.length} thay đổi
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            Đang tải tham số cấu hình...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Key</th>
                  <th className="px-6 py-3">Giá trị (Value)</th>
                  <th className="px-6 py-3">Cập nhật lần cuối</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {configs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                      Chưa có tham số nào được lưu trong `system_configs`.
                    </td>
                  </tr>
                ) : (
                  configs.map((item) => {
                    const isDirty =
                      draftValues[item.key] !== undefined && draftValues[item.key] !== item.value;
                    return (
                      <tr key={item.key} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5 font-mono font-bold text-[#08243D] whitespace-nowrap">
                          {item.key}
                          {isDirty && (
                            <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-amber-100 text-amber-800 font-sans">
                              Đã sửa
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 min-w-[240px]">
                          <input
                            type="text"
                            value={draftValues[item.key] ?? item.value}
                            onChange={(e) =>
                              setDraftValues((prev) => ({ ...prev, [item.key]: e.target.value }))
                            }
                            disabled={savingTable}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                          />
                        </td>
                        <td className="px-6 py-3.5 text-slate-400 whitespace-nowrap">
                          {formatDateTime(item.updated_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Inline Add New Config */}
        <form
          onSubmit={handleAddConfig}
          className="p-5 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value.toUpperCase())}
            placeholder="KEY_CAU_HINH_MOI"
            disabled={savingTable}
            className="sm:w-64 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-bold text-[#08243D] outline-none focus:border-teal-500"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Giá trị cấu hình..."
            disabled={savingTable}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-mono font-medium text-slate-800 outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={savingTable || !newKey.trim() || !newValue.trim()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#08243D] hover:bg-[#0d3254] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm / Cập nhật
          </button>
        </form>
      </div>
    </div>
  );
}
