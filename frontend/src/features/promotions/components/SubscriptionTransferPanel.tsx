'use client';

import * as React from 'react';
import { AlertTriangle, ArrowLeft, Check, Copy, Landmark, Loader2, XCircle } from 'lucide-react';
import { useSubscriptionOrderStatus } from '../hooks/useSubscriptionOrderStatus';
import type { SubscriptionBankTransferCheckout } from '../types/subscription.types';

interface SubscriptionTransferPanelProps {
  checkout: SubscriptionBankTransferCheckout;
  onPaid: () => void;
  onBack: () => void;
}

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';

function CopyRow({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // trình duyệt chặn clipboard — khách vẫn chép tay được
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-xs font-semibold text-slate-500 shrink-0">{label}</span>
      <button
        type="button"
        onClick={handleCopy}
        title={`Sao chép ${label.toLowerCase()}`}
        className="group flex items-center gap-2 min-w-0 rounded-lg px-2 py-1 -mr-2 hover:bg-slate-100 text-slate-900"
      >
        <span className="font-bold text-sm text-right break-words min-w-0">{children ?? value}</span>
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-700 shrink-0" />
        )}
      </button>
    </div>
  );
}

export function SubscriptionTransferPanel({ checkout, onPaid, onBack }: SubscriptionTransferPanelProps) {
  const { status, isChecking, checkNow } = useSubscriptionOrderStatus(checkout.orderId);
  const [notReceivedYet, setNotReceivedYet] = React.useState(false);

  React.useEffect(() => {
    if (status === 'PAID') onPaid();
  }, [status, onPaid]);

  if (status === 'CANCELLED') {
    return (
      <div className="text-center py-6">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h4 className="mt-3 font-black text-slate-800">Mã thanh toán này đã hết hiệu lực</h4>
        <p className="mt-1 text-sm text-slate-500">
          Nếu bạn đã chuyển tiền vào mã này, số tiền sẽ được hoàn tự động vào Ví PetCare.
        </p>
        <button type="button" onClick={onBack} className="mt-4 text-sm font-bold text-slate-500 hover:text-slate-800">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Landmark className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h4 className="font-black text-slate-800 text-sm">
            Chuyển khoản mua {checkout.planName} ({checkout.durationDays} ngày)
          </h4>
          <p className="text-xs text-slate-500">Gói được kích hoạt tự động khi ngân hàng báo có</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-start">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-white p-2 rounded-2xl border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR động từ dịch vụ ngoài */}
            <img
              src={checkout.qrImageUrl}
              alt={`Mã VietQR chuyển ${formatPrice(checkout.amount)} mua ${checkout.planName}`}
              className="w-44 h-44 object-contain"
            />
          </div>
          <p className="text-[11px] text-slate-500 text-center max-w-44">
            Quét bằng app ngân hàng — số tiền và nội dung đã điền sẵn.
          </p>
        </div>

        <div className="min-w-0">
          <div className="bg-slate-50 rounded-2xl px-4 divide-y divide-slate-200">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-xs font-semibold text-slate-500">Ngân hàng</span>
              <span className="font-bold text-sm text-slate-900 text-right">{checkout.bankName}</span>
            </div>
            <CopyRow label="Số tài khoản" value={checkout.accountNumber} />
            <div className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-xs font-semibold text-slate-500">Chủ tài khoản</span>
              <span className="font-bold text-sm text-slate-900 text-right">{checkout.accountName}</span>
            </div>
            <CopyRow label="Số tiền" value={String(checkout.amount)}>
              <span className="text-emerald-600 font-black">{formatPrice(checkout.amount)}</span>
            </CopyRow>
            <CopyRow label="Nội dung CK" value={checkout.transferContent}>
              <span className="inline-block font-mono tracking-wide bg-white border border-slate-200 rounded-md px-2 py-0.5">
                {checkout.transferContent}
              </span>
            </CopyRow>
          </div>

          <div className="mt-3 flex gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Giữ nguyên nội dung <strong className="font-mono">{checkout.transferContent}</strong> và đúng số tiền.
              Sai mã <strong className="font-mono">{checkout.paymentCode}</strong>, hệ thống không tự kích hoạt gói được.
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500" role="status" aria-live="polite">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Đang chờ ngân hàng xác nhận giao dịch…
          </div>

          {notReceivedYet && (
            <p className="mt-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3">
              Chưa nhận được tiền. Ngân hàng thường báo về trong vài giây đến 1–2 phút, trang sẽ tự cập nhật.
            </p>
          )}

          <button
            type="button"
            disabled={isChecking}
            onClick={async () => {
              setNotReceivedYet(false);
              if ((await checkNow()) === 'PENDING') setNotReceivedYet(true);
            }}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-[#0a1128] text-white font-bold py-3 rounded-2xl hover:bg-slate-800 disabled:opacity-70"
          >
            {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isChecking ? 'Đang kiểm tra…' : 'Tôi đã chuyển khoản'}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" />
        Chọn phương thức khác
      </button>
    </div>
  );
}
