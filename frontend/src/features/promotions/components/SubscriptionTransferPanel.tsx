'use client';

import * as React from 'react';
import { AlertTriangle, ArrowLeft, Check, Copy, ExternalLink, Landmark, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { useSubscriptionOrderStatus } from '../hooks/useSubscriptionOrderStatus';
import type { SubscriptionBankTransferCheckout } from '../types/subscription.types';

interface SubscriptionTransferPanelProps {
  checkout: SubscriptionBankTransferCheckout;
  onPaid: () => void;
  onBack: () => void;
  onCancelOrder?: (orderId: string) => Promise<void>;
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
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-xs font-medium text-slate-500 shrink-0">{label}</span>
      <button
        type="button"
        onClick={handleCopy}
        title={`Sao chép ${label.toLowerCase()}`}
        className="group flex items-center gap-2 min-w-0 rounded-lg px-2.5 py-1 -mr-2 hover:bg-slate-100 text-slate-900 transition-colors cursor-pointer"
      >
        <span className="font-bold text-sm text-right break-words min-w-0">{children ?? value}</span>
        {copied ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 shrink-0">
            <Check className="w-3.5 h-3.5" />
            Đã chép
          </span>
        ) : (
          <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#08243D] shrink-0" />
        )}
      </button>
    </div>
  );
}

export function SubscriptionTransferPanel({ checkout, onPaid, onBack, onCancelOrder }: SubscriptionTransferPanelProps) {
  const { status, isChecking, checkNow } = useSubscriptionOrderStatus(checkout.orderId);
  const [notReceivedYet, setNotReceivedYet] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [confirmCancel, setConfirmCancel] = React.useState(false);

  React.useEffect(() => {
    if (status === 'PAID') onPaid();
  }, [status, onPaid]);

  if (status === 'CANCELLED') {
    return (
      <div className="text-center py-8">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h4 className="mt-3 font-bold text-[#08243D]">Mã thanh toán này đã hết hiệu lực</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
          Nếu bạn đã chuyển tiền vào mã này, số tiền sẽ được hoàn tự động vào Ví PetCare.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 rounded-xl bg-[#08243D] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c3254] cursor-pointer"
        >
          Chọn lại phương thức thanh toán
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/70 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#08243D] flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-[#F7C948]" />
          </div>
          <div>
            <h4 className="font-bold text-[#08243D] text-sm">
              Chuyển khoản VietQR — {checkout.planName} ({checkout.durationDays} ngày)
            </h4>
            <p className="text-xs text-slate-500">
              Mã đơn: <span className="font-mono font-bold text-[#08243D]">{checkout.paymentCode}</span> · Kích hoạt tự động sau khi chuyển khoản
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-700 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          Chờ thanh toán
        </span>
      </div>

      <div className="grid sm:grid-cols-[200px_1fr] gap-5 items-start">
        <div className="flex flex-col items-center gap-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
          <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh QR động từ dịch vụ ngoài */}
            <img
              src={checkout.qrImageUrl}
              alt={`Mã VietQR chuyển ${formatPrice(checkout.amount)} mua ${checkout.planName}`}
              className="w-40 h-40 object-contain"
            />
          </div>
          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Mở ứng dụng ngân hàng để quét mã QR (đã điền sẵn số tiền & nội dung).
          </p>
          <a
            href={checkout.qrImageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-[#08243D] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Mở ảnh QR cỡ lớn
          </a>
        </div>

        <div className="min-w-0 space-y-3">
          <div className="bg-slate-50/80 rounded-2xl px-4 border border-slate-200/70 divide-y divide-slate-200/70">
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-xs font-medium text-slate-500">Ngân hàng thụ hưởng</span>
              <span className="font-bold text-sm text-[#08243D] text-right">{checkout.bankName}</span>
            </div>
            <CopyRow label="Số tài khoản" value={checkout.accountNumber} />
            <div className="flex items-center justify-between gap-3 py-3">
              <span className="text-xs font-medium text-slate-500">Chủ tài khoản</span>
              <span className="font-bold text-sm text-[#08243D] text-right">{checkout.accountName}</span>
            </div>
            <CopyRow label="Số tiền cần chuyển" value={String(checkout.amount)}>
              <span className="text-teal-700 font-bold text-base tabular-nums">{formatPrice(checkout.amount)}</span>
            </CopyRow>
            <CopyRow label="Nội dung chuyển khoản" value={checkout.transferContent}>
              <span className="inline-block font-mono text-xs font-bold tracking-wide bg-white border border-slate-200 text-[#08243D] rounded-lg px-2.5 py-1">
                {checkout.transferContent}
              </span>
            </CopyRow>
          </div>

          <div className="flex gap-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Vui lòng giữ nguyên nội dung <strong className="font-mono">{checkout.transferContent}</strong> và chuyển đúng{' '}
              <strong>{formatPrice(checkout.amount)}</strong> để hệ thống tự động kích hoạt gói.
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 pt-1" role="status" aria-live="polite">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Hệ thống đang tự động kiểm tra giao dịch…</span>
            </div>
          </div>

          {notReceivedYet && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
              Hệ thống chưa ghi nhận giao dịch từ ngân hàng. Thông thường ngân hàng xử lý trong 10 giây – 2 phút. Bạn có thể bấm kiểm tra lại hoặc đóng cửa sổ này và theo dõi trong mục Lịch sử mua gói.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              disabled={isChecking || isCancelling}
              onClick={async () => {
                setNotReceivedYet(false);
                if ((await checkNow()) === 'PENDING') setNotReceivedYet(true);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-[#08243D] text-[#F7C948] font-bold text-xs py-3 px-4 rounded-xl hover:bg-[#0c3254] disabled:opacity-70 transition-colors cursor-pointer"
            >
              {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isChecking ? 'Đang kiểm tra giao dịch…' : 'Tôi đã chuyển khoản (Kiểm tra ngay)'}
            </button>

            <button
              type="button"
              disabled={isCancelling}
              onClick={onBack}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[#08243D] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Đổi phương thức
            </button>
          </div>

          {onCancelOrder && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              {!confirmCancel ? (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Huỷ đơn thanh toán này
                </button>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 w-full bg-rose-50/80 border border-rose-200 rounded-xl px-3 py-2">
                  <span className="text-xs font-medium text-rose-800">
                    Xác nhận huỷ mã thanh toán <strong className="font-mono">{checkout.paymentCode}</strong>?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={async () => {
                        setIsCancelling(true);
                        try {
                          await onCancelOrder(checkout.orderId);
                        } finally {
                          setIsCancelling(false);
                          setConfirmCancel(false);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                    >
                      {isCancelling && <Loader2 className="w-3 h-3 animate-spin" />}
                      Xác nhận huỷ
                    </button>
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => setConfirmCancel(false)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Không
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
