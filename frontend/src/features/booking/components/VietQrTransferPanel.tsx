'use client';

import * as React from 'react';
import { AlertTriangle, ArrowLeft, Check, Clock, Copy, Landmark, Loader2, XCircle } from 'lucide-react';
import type { BankTransferCheckout } from '../services/payment.service';
import { useBookingPaymentStatus } from '../hooks/useBookingPaymentStatus';

interface VietQrTransferPanelProps {
  bookingId: string;
  checkout: BankTransferCheckout;
  /** Backend đã xác nhận nhận được tiền */
  onPaid: () => void;
  /** Quay lại chọn phương thức khác */
  onBack: () => void;
}

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

/** Số giây còn lại tới `expiresAt`, cập nhật mỗi giây. */
function useSecondsLeft(expiresAt: string) {
  const deadline = React.useMemo(() => new Date(expiresAt).getTime(), [expiresAt]);
  const compute = React.useCallback(() => Math.max(0, Math.floor((deadline - Date.now()) / 1000)), [deadline]);
  const [secondsLeft, setSecondsLeft] = React.useState(compute);

  React.useEffect(() => {
    const timer = setInterval(() => setSecondsLeft(compute()), 1000);
    return () => clearInterval(timer);
  }, [compute]);

  return Number.isFinite(deadline) ? secondsLeft : null;
}

function HoldCountdown({ expiresAt }: { expiresAt: string }) {
  const secondsLeft = useSecondsLeft(expiresAt);
  if (secondsLeft === null) return null;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const urgent = secondsLeft <= 5 * 60;
  const until = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date(expiresAt));

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 mb-6 border ${
        urgent ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}
    >
      <span className="flex items-center gap-2 text-xs font-semibold">
        <Clock className="w-4 h-4" />
        {secondsLeft > 0 ? `Giữ chỗ đến ${until}` : 'Đã hết thời gian giữ chỗ'}
      </span>
      <span className="font-mono text-lg font-black tabular-nums" aria-label={`Còn ${mm} phút ${ss} giây`}>
        {mm}:{ss}
      </span>
    </div>
  );
}

function CopyRow({
  label,
  value,
  display,
  highlight,
}: {
  label: string;
  value: string;
  display?: React.ReactNode;
  highlight?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Trình duyệt chặn clipboard (http, iframe...) — khách vẫn chép tay được
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-xs font-semibold text-slate-500 shrink-0">{label}</span>
      <button
        type="button"
        onClick={handleCopy}
        className={`group flex items-center gap-2 min-w-0 rounded-lg px-2 py-1 -mr-2 transition-colors hover:bg-slate-100 ${
          highlight ? 'text-[#0a1128]' : 'text-slate-900'
        }`}
        title={`Sao chép ${label.toLowerCase()}`}
      >
        <span className={`font-bold text-sm ${highlight ? 'text-right break-words' : 'truncate'}`}>{display ?? value}</span>
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
        )}
      </button>
    </div>
  );
}

export function VietQrTransferPanel({ bookingId, checkout, onPaid, onBack }: VietQrTransferPanelProps) {
  const { state, isChecking, checkNow } = useBookingPaymentStatus(bookingId, true);
  const [notReceivedYet, setNotReceivedYet] = React.useState(false);

  React.useEffect(() => {
    if (state === 'PAID') onPaid();
  }, [state, onPaid]);

  const handleConfirmTransferred = async () => {
    setNotReceivedYet(false);
    const result = await checkNow();
    if (result === 'PENDING') setNotReceivedYet(true);
  };

  if (state === 'EXPIRED') {
    return (
      <div className="w-full max-w-md bg-white border border-rose-200 rounded-[24px] p-8 shadow-sm text-center">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="mt-4 text-lg font-black text-slate-800">Đơn đã hết thời gian giữ chỗ</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Nếu bạn đã chuyển tiền, số tiền sẽ được hoàn tự động vào Ví PetCare. Vui lòng đặt lịch lại.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-2xs animate-scale-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#08243D] flex items-center justify-center shrink-0">
          <Landmark className="w-5 h-5 text-[#F7C948]" />
        </div>
        <div>
          <h3 className="font-bold text-[#08243D]">Chuyển khoản ngân hàng (VietQR)</h3>
          <p className="text-xs text-slate-500">Xác nhận tự động ngay khi ngân hàng báo có</p>
        </div>
      </div>

      {checkout.expiresAt && <HoldCountdown expiresAt={checkout.expiresAt} />}

      <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-start">
        {/* QR */}
        <div className="flex flex-col items-center gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR động từ dịch vụ ngoài */}
            <img
              src={checkout.qrImageUrl}
              alt={`Mã VietQR chuyển ${formatPrice(checkout.amount)} vào ${checkout.bankName}`}
              className="w-56 h-56 object-contain"
            />
          </div>
          <p className="text-xs text-slate-500 text-center max-w-56">
            Mở app ngân hàng bất kỳ, quét mã. Số tiền và nội dung đã được điền sẵn.
          </p>
        </div>

        {/* Thông tin chuyển khoản */}
        <div className="min-w-0">
          <div className="bg-slate-50 rounded-2xl px-4 divide-y divide-slate-200">
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-xs font-semibold text-slate-500">Ngân hàng</span>
              <span className="font-bold text-sm text-slate-900 text-right">{checkout.bankName}</span>
            </div>
            <CopyRow label="Số tài khoản" value={checkout.accountNumber} />
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-xs font-semibold text-slate-500">Chủ tài khoản</span>
              <span className="font-bold text-sm text-slate-900 text-right">{checkout.accountName}</span>
            </div>
            <CopyRow
              label="Số tiền"
              value={String(checkout.amount)}
              display={<span className="text-emerald-600 text-base font-black">{formatPrice(checkout.amount)}</span>}
            />
            <CopyRow
              label="Nội dung CK"
              value={checkout.transferContent}
              highlight
              display={
                <span className="inline-block font-mono tracking-wide bg-white border border-slate-200 rounded-md px-2 py-0.5">
                  {checkout.transferContent}
                </span>
              }
            />
          </div>

          <div className="mt-4 flex gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Giữ nguyên nội dung <strong className="font-mono">{checkout.transferContent}</strong> và đúng số tiền.
              Sai nội dung, hệ thống không tự xác nhận được đơn. Nếu đơn hết hạn trước khi nhận được tiền, số tiền sẽ
              được hoàn vào Ví PetCare.
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500" role="status" aria-live="polite">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Đang chờ ngân hàng xác nhận giao dịch…
          </div>

          {notReceivedYet && (
            <p className="mt-3 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
              Chưa nhận được tiền. Ngân hàng thường báo về trong vài giây đến 1–2 phút — vui lòng giữ trang này, đơn
              sẽ tự cập nhật.
            </p>
          )}

          <button
            type="button"
            onClick={handleConfirmTransferred}
            disabled={isChecking}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-[#08243D] text-[#F7C948] font-bold text-xs py-3.5 px-4 rounded-xl hover:bg-[#0c3254] disabled:opacity-70 transition-all cursor-pointer active:scale-[0.98]"
          >
            {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isChecking ? 'Đang kiểm tra giao dịch…' : 'Tôi đã chuyển khoản (Kiểm tra ngay)'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#08243D] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Chọn phương thức khác
      </button>
    </div>
  );
}
