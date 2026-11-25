'use client';

import * as React from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Crown,
  Loader2,
  QrCode,
  RefreshCw,
  RotateCcw,
  XCircle,
  Sparkles,
  ShieldCheck,
  Stethoscope,
  Zap,
  HelpCircle,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Portal } from '@/components/ui/Portal';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionModal, formatPlanPeriod } from './SubscriptionModal';
import { getPlanBenefits, type SubscriptionOrder, type SubscriptionOrderStatus, type SubscriptionPaymentMethod } from '../types/subscription.types';

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + ' đ';
const formatDate = (val: string) => new Date(val).toLocaleDateString('vi-VN');
const formatDateTime = (val: string) =>
  new Date(val).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const ORDER_STATUS: Record<SubscriptionOrderStatus, { label: string; badge: string }> = {
  PENDING: { label: 'Chờ thanh toán', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  PAID: { label: 'Đã thanh toán', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã huỷ', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const METHOD_LABEL: Record<SubscriptionPaymentMethod, string> = {
  BANK_TRANSFER: 'Chuyển khoản',
  VNPAY: 'VNPay',
  WALLET: 'Ví PetCare',
};

const COMPARISON_ROWS = [
  {
    feature: 'Mức giảm giá khi đặt dịch vụ (Booking)',
    free: '0%',
    basic: 'Giảm 5%',
    premium: 'Giảm 15%',
    yearly: 'Giảm 15% (+ Tặng 2 buổi Spa)',
  },
  {
    feature: 'Phí dịch vụ nền tảng (Platform fee)',
    free: 'Thu theo đơn',
    basic: 'Miễn phí 100%',
    premium: 'Miễn phí 100%',
    yearly: 'Miễn phí 100%',
  },
  {
    feature: 'Ưu tiên ghép Chuyên viên (Matching)',
    free: 'Hàng đợi tiêu chuẩn',
    basic: 'Ưu tiên cấp 1',
    premium: 'Ưu tiên hàng đầu (Lễ, Tết, Cao điểm)',
    yearly: 'Ưu tiên tối cao (Giữ chỗ trước)',
  },
  {
    feature: 'Tư vấn y tế trực tuyến với Bác sĩ Thú y',
    free: 'Tính phí theo lượt',
    basic: '1 lần / tháng',
    premium: 'Không giới hạn 24/7 qua Chat',
    yearly: 'Không giới hạn 24/7 (Bác sĩ chuyên khoa)',
  },
  {
    feature: 'Quỹ bảo hiểm bảo vệ sự cố thú cưng',
    free: 'Không hỗ trợ',
    basic: 'Lên đến 2.000.000 đ',
    premium: 'Lên đến 5.000.000 đ',
    yearly: 'Lên đến 20.000.000 đ',
  },
  {
    feature: 'Giới hạn số thú cưng trong hồ sơ',
    free: 'Tối đa 1 bé',
    basic: 'Tối đa 2 bé',
    premium: 'Không giới hạn',
    yearly: 'Không giới hạn',
  },
  {
    feature: 'Tốc độ hỗ trợ CSKH & Trọng tài khiếu nại',
    free: 'Trong 24 giờ',
    basic: 'Trong 4 giờ',
    premium: 'Ưu tiên trong 2 giờ (Kênh VIP)',
    yearly: 'Ưu tiên trong 2 giờ (Kênh VIP)',
  },
  {
    feature: 'Quà tặng sinh nhật thú cưng & Tri ân',
    free: '—',
    basic: 'Voucher 20.000 đ',
    premium: 'Hộp quà sinh nhật PetCare',
    yearly: 'Bộ quà tặng VIP cao cấp hàng năm',
  },
];

const FAQS = [
  {
    question: 'Gói hội viên có tự động gia hạn hoặc trừ tiền ngầm không?',
    answer: 'Hoàn toàn không. PetCare áp dụng cơ chế thanh toán chủ động qua VietQR hoặc Ví PetCare. Chúng tôi không bao giờ tự động trừ tiền thẻ ngân hàng của bạn. Bạn có thể gia hạn thêm kỳ khi muốn.',
  },
  {
    question: 'Tôi có thể đổi từ gói Cơ Bản lên VIP Pro được không?',
    answer: 'Có. Khi bạn đăng ký gói mới, thời gian hiệu lực của gói cũ sẽ được hệ thống bảo lưu và kích hoạt gói mới ngay lập tức hoặc nối tiếp thông minh.',
  },
  {
    question: 'Sau khi chuyển khoản qua VietQR bao lâu thì gói được kích hoạt?',
    answer: 'Hệ thống đối soát SePay tự động nhận diện mã giao dịch và kích hoạt đặc quyền hội viên cho tài khoản của bạn ngay lập tức trong 5 - 30 giây.',
  },
  {
    question: 'Ưu đãi giảm giá của gói có áp dụng chung với Voucher khuyến mãi không?',
    answer: 'Có! Khi bạn là Hội viên, bạn vừa được hưởng mức giảm giá định kỳ theo gói, vừa có thể nhập thêm mã giảm giá (Voucher) khi thanh toán để nhân đôi quyền lợi.',
  },
];


export function MembershipView() {
  const {
    plans,
    mySubscription,
    myOrders,
    isLoading,
    error,
    openModal,
    fetchAll,
    checkOrderStatus,
    cancelOrder,
  } = useSubscription();

  const router = useRouter();
  const [orderFilter, setOrderFilter] = React.useState<'ALL' | SubscriptionOrderStatus>('ALL');
  const [checkingOrderId, setCheckingOrderId] = React.useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = React.useState<string | null>(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = React.useState<SubscriptionOrder | null>(null);
  const [paidOrderPopup, setPaidOrderPopup] = React.useState<SubscriptionOrder | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [checkFeedback, setCheckFeedback] = React.useState<{ orderId: string; text: string; tone: 'amber' | 'emerald' } | null>(null);

  const featuredPlanId = React.useMemo(() => {
    if (plans.length === 0) return null;
    const vipPro = plans.find((p) => p.name.toLowerCase().includes('vip') || p.code.toLowerCase().includes('vip'));
    if (vipPro) return vipPro.id;
    return plans.length >= 2 ? plans[1].id : null;
  }, [plans]);

  const pendingOrders = React.useMemo(
    () => myOrders.filter((o) => o.status === 'PENDING'),
    [myOrders],
  );
  const latestPendingOrder = pendingOrders[0] ?? null;

  const filteredOrders = React.useMemo(() => {
    if (orderFilter === 'ALL') return myOrders;
    return myOrders.filter((o) => o.status === orderFilter);
  }, [myOrders, orderFilter]);

  const activePlanDetails = React.useMemo(() => {
    if (!mySubscription) return null;
    return plans.find((p) => p.code === mySubscription.planCode) ?? null;
  }, [mySubscription, plans]);

  const remainingDays = React.useMemo(() => {
    if (!mySubscription) return 0;
    const diff = new Date(mySubscription.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  }, [mySubscription]);

  const handleCopyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } catch {
      // ignore clipboard error
    }
  };

  const handleResumePayment = (order: SubscriptionOrder) => {
    if (order.method === 'BANK_TRANSFER') {
      openModal(order.planCode, { method: 'BANK_TRANSFER', autoStartTransfer: true });
    } else {
      openModal(order.planCode, { method: order.method, autoStartTransfer: false });
    }
  };

  const handleChangeMethod = (order: SubscriptionOrder) => {
    openModal(order.planCode, { method: order.method, autoStartTransfer: false });
  };

  const handleCheckStatus = async (order: SubscriptionOrder) => {
    setCheckingOrderId(order.id);
    setCheckFeedback(null);
    const updated = await checkOrderStatus(order.id);
    setCheckingOrderId(null);
    if (!updated) return;
    if (updated.status === 'PAID') {
      setPaidOrderPopup(updated);
      setCheckFeedback({
        orderId: order.id,
        text: `Đơn ${order.paymentCode} đã được thanh toán và kích hoạt gói thành công!`,
        tone: 'emerald',
      });
    } else if (updated.status === 'PENDING') {
      setCheckFeedback({
        orderId: order.id,
        text: `Đơn ${order.paymentCode} vẫn đang chờ ngân hàng / cổng thanh toán xác nhận. Bạn có thể bấm "Thanh toán ngay" để xem lại mã QR hoặc đổi phương thức.`,
        tone: 'amber',
      });
    }
  };

  const handleConfirmCancelOrder = async () => {
    if (!confirmCancelOrder) return;
    const target = confirmCancelOrder;
    setCancellingOrderId(target.id);
    const ok = await cancelOrder(target.id);
    setCancellingOrderId(null);
    setConfirmCancelOrder(null);
    if (ok) {
      setCheckFeedback({
        orderId: target.id,
        text: `Đã huỷ đơn thanh toán ${target.paymentCode} (${target.planName}).`,
        tone: 'amber',
      });
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#08243D] flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#F7C948]" />
            Gói Hội Viên
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Đăng ký gói hội viên để nhận ưu đãi định kỳ và quyền lợi ưu tiên khi đặt dịch vụ.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchAll()}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#08243D] transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {/* 1. Active Subscription Detailed Card */}
      {mySubscription && (
        <div className="rounded-3xl bg-[#08243D] text-white p-6 md:p-7 shadow-sm border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-[11px] font-bold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Đang hoạt động
                </span>
                <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#F7C948]">
                  {mySubscription.planCode}
                </span>
                <span className="text-xs text-slate-300">
                  Còn <strong className="text-white">{remainingDays} ngày</strong> sử dụng
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">{mySubscription.planName}</h3>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-300">
                  <span>
                    Ngày bắt đầu: <strong className="text-white">{formatDate(mySubscription.startsAt)}</strong>
                  </span>
                  <span>
                    Hết hạn kỳ hiện tại:{' '}
                    <strong className="text-white">{formatDate(mySubscription.currentPeriodEndsAt)}</strong>
                  </span>
                  <span>
                    Tổng hiệu lực đến: <strong className="text-[#F7C948]">{formatDate(mySubscription.expiresAt)}</strong>
                  </span>
                </div>
              </div>

              {activePlanDetails && (() => {
                const activeBenefitsList = getPlanBenefits(activePlanDetails);
                return activeBenefitsList.length > 0 ? (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {activeBenefitsList.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-200"
                      >
                        <Check className="w-3.5 h-3.5 text-[#F7C948]" />
                        {b}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openModal(mySubscription.planCode)}
                className="rounded-xl bg-[#F7C948] px-5 py-3 text-xs font-bold text-[#08243D] hover:bg-[#e5b83b] transition-colors cursor-pointer"
              >
                Gia hạn thêm kỳ mới
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pending Order Quick-Resume Banner */}
      {latestPendingOrder && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Đơn đăng ký đang chờ thanh toán
                </span>
                <span className="font-mono text-[11px] font-bold bg-white border border-amber-200 text-[#08243D] px-2 py-0.5 rounded-md">
                  {latestPendingOrder.paymentCode}
                </span>
              </div>
              <p className="text-sm font-bold text-[#08243D]">
                {latestPendingOrder.planName} — {formatPrice(latestPendingOrder.amount)}{' '}
                <span className="font-normal text-xs text-slate-600">
                  ({METHOD_LABEL[latestPendingOrder.method]} · {formatPlanPeriod(latestPendingOrder.durationDays)})
                </span>
              </p>
              <p className="text-xs text-slate-600">
                {latestPendingOrder.method === 'BANK_TRANSFER'
                  ? `Nội dung chuyển khoản: "${latestPendingOrder.transferContent || latestPendingOrder.paymentCode}". Bấm "Thanh toán ngay (Mã QR)" để quét lại mã VietQR hoặc đổi sang phương thức khác.`
                  : 'Đơn thanh toán của bạn chưa hoàn tất. Bạn có thể thanh toán lại hoặc đổi sang phương thức khác.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleResumePayment(latestPendingOrder)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#08243D] px-4 py-2.5 text-xs font-bold text-[#F7C948] hover:bg-[#0c3254] transition-colors cursor-pointer"
            >
              {latestPendingOrder.method === 'BANK_TRANSFER' ? (
                <>
                  <QrCode className="w-3.5 h-3.5" />
                  Thanh toán ngay (Mã QR)
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  Thanh toán lại
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleChangeMethod(latestPendingOrder)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-xs font-bold text-[#08243D] hover:bg-amber-50 transition-colors cursor-pointer"
            >
              Đổi phương thức
            </button>

            <button
              type="button"
              disabled={checkingOrderId === latestPendingOrder.id}
              onClick={() => handleCheckStatus(latestPendingOrder)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-[#08243D] transition-colors cursor-pointer disabled:opacity-50"
            >
              {checkingOrderId === latestPendingOrder.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Kiểm tra TT
            </button>

            <button
              type="button"
              disabled={cancellingOrderId === latestPendingOrder.id}
              onClick={() => setConfirmCancelOrder(latestPendingOrder)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              Huỷ thanh toán
            </button>
          </div>
        </div>
      )}

      {checkFeedback && (
        <div
          className={`rounded-2xl border p-3.5 text-xs font-medium flex items-center justify-between gap-3 ${
            checkFeedback.tone === 'emerald'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <span>{checkFeedback.text}</span>
          <button
            type="button"
            onClick={() => setCheckFeedback(null)}
            className="text-xs font-bold underline cursor-pointer shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3.5 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      {/* 3. Plan Cards Grid */}
      {isLoading && plans.length === 0 ? (
        <div className="flex justify-center py-14">
          <Loader2 className="w-6 h-6 animate-spin text-[#08243D]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = mySubscription?.planCode === p.code;
            const blocked = Boolean(mySubscription && !isCurrent);
            const isFeatured = p.id === featuredPlanId;
            const pendingOrderForPlan = myOrders.find((o) => o.planCode === p.code && o.status === 'PENDING');

            return (
              <div
                key={p.id}
                className={`card-hover-lift rounded-3xl p-7 flex flex-col justify-between ${
                  isFeatured
                    ? 'bg-[#08243D] text-white shadow-lg ring-1 ring-[#F7C948]/30'
                    : 'bg-white text-slate-800 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold ${isFeatured ? 'text-white' : 'text-[#08243D]'}`}>{p.name}</h3>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                          isFeatured ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.code}
                      </span>
                    </div>

                    {isCurrent ? (
                      <span className="text-[10px] font-bold bg-emerald-500 text-white rounded-full px-2.5 py-0.5 shrink-0">
                        Đang dùng
                      </span>
                    ) : pendingOrderForPlan ? (
                      <span className="text-[10px] font-bold bg-amber-400 text-[#08243D] rounded-full px-2.5 py-0.5 shrink-0">
                        Chờ thanh toán
                      </span>
                    ) : isFeatured ? (
                      <span className="text-[10px] font-bold bg-[#F7C948] text-[#08243D] rounded-full px-2.5 py-0.5 shrink-0">
                        Phổ biến
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-4 flex items-baseline gap-1.5">
                    <span className={`text-3xl font-bold tabular-nums ${isFeatured ? 'text-[#F7C948]' : 'text-[#08243D]'}`}>
                      {formatPrice(p.price)}
                    </span>
                    <span className={`text-xs ${isFeatured ? 'text-slate-300' : 'text-slate-400'}`}>
                      / {formatPlanPeriod(p.durationDays)} ({p.durationDays} ngày)
                    </span>
                  </p>

                  {p.description && (
                    <p className={`mt-2 text-xs leading-relaxed ${isFeatured ? 'text-slate-300' : 'text-slate-500'}`}>
                      {p.description}
                    </p>
                  )}

                  {(() => {
                    const cardBenefitsList = getPlanBenefits(p);
                    return cardBenefitsList.length > 0 ? (
                      <ul className={`mt-5 pt-5 border-t space-y-2.5 ${isFeatured ? 'border-white/10' : 'border-slate-100'}`}>
                        {cardBenefitsList.map((b) => (
                          <li key={b} className={`flex gap-2.5 text-xs ${isFeatured ? 'text-slate-200' : 'text-slate-600'}`}>
                            <Check className={`w-4 h-4 shrink-0 ${isFeatured ? 'text-[#F7C948]' : 'text-teal-600'}`} />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
                </div>

                <div className="mt-7 space-y-2">
                  {pendingOrderForPlan && !blocked ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleResumePayment(pendingOrderForPlan)}
                        className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition-colors cursor-pointer ${
                          isFeatured
                            ? 'bg-[#F7C948] text-[#08243D] hover:bg-[#e5b83b]'
                            : 'bg-[#08243D] text-[#F7C948] hover:bg-[#0c3254]'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        {pendingOrderForPlan.method === 'BANK_TRANSFER'
                          ? 'Tiếp tục thanh toán (Mã QR)'
                          : 'Thanh toán lại đơn đang chờ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChangeMethod(pendingOrderForPlan)}
                        className={`w-full rounded-xl py-2 text-[11px] font-semibold transition-colors cursor-pointer ${
                          isFeatured
                            ? 'text-slate-300 hover:text-white hover:bg-white/10'
                            : 'text-slate-500 hover:text-[#08243D] hover:bg-slate-100'
                        }`}
                      >
                        Đổi phương thức thanh toán khác
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => openModal(p.code)}
                        disabled={blocked}
                        title={blocked ? 'Bạn có thể chọn gói khác sau khi gói hiện tại hết hạn' : undefined}
                        className={`w-full rounded-xl py-3 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          isFeatured
                            ? 'bg-[#F7C948] text-[#08243D] hover:bg-[#e5b83b]'
                            : 'bg-[#08243D] text-white hover:bg-[#0c3254]'
                        }`}
                      >
                        {isCurrent ? 'Gia hạn thêm kỳ' : 'Đăng ký ngay'}
                      </button>
                      {blocked && mySubscription && (
                        <p className={`text-[11px] text-center ${isFeatured ? 'text-slate-300' : 'text-slate-400'}`}>
                          Đổi sang gói này sau khi hết hạn gói {mySubscription.planName} ({formatDate(mySubscription.expiresAt)})
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {!isLoading && plans.length === 0 && (
            <p className="text-sm text-slate-500 col-span-full text-center py-8">Hiện chưa có gói nào được mở bán.</p>
          )}
        </div>
      )}

      
      {/* 4. Value Pillars: Tại sao nên mua gói hội viên */}
      <div className="rounded-3xl border border-slate-200/80 bg-linear-to-b from-white to-slate-50/50 p-6 md:p-8 space-y-6 shadow-2xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7C948]/15 border border-[#F7C948]/30 text-xs font-bold text-[#08243D]">
            <Sparkles className="w-3.5 h-3.5 text-[#d49d13]" />
            Đặc Quyền Hội Viên PetCare
          </div>
          <h3 className="text-lg md:text-xl font-bold text-[#08243D] mt-2">
            Tại sao bạn nên nâng cấp gói hội viên PetCare?
          </h3>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Đầu tư nhỏ mỗi tháng, nhận lại sự an tâm tuyệt đối và tiết kiệm vượt trội trên mỗi đơn đặt lịch chăm sóc thú cưng của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-2.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#F7C948]" />
            </div>
            <h4 className="text-sm font-bold text-[#08243D]">Hoàn vốn chỉ sau 1-2 đơn</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Giảm trực tiếp 5% - 15% tổng hóa đơn và miễn 100% phí dịch vụ nền tảng. Số tiền tiết kiệm nhanh chóng vượt xa chi phí mua gói.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-2.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#08243D]" />
            </div>
            <h4 className="text-sm font-bold text-[#08243D]">Ưu tiên ghép Chuyên viên 5 sao</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Vào dịp Lễ Tết hoặc cuối tuần cao điểm, yêu cầu của bạn luôn được hệ thống ưu tiên kết nối với các thợ chăm sóc giỏi nhất.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-2.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
            </div>
            <h4 className="text-sm font-bold text-[#08243D]">Bác sĩ thú y tư vấn 24/7</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hỏi đáp y tế, dinh dưỡng và nhận hướng dẫn xử trí khi thú cưng có dấu hiệu bất thường trực tuyến qua Chat với Bác sĩ thú y.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-2.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
            </div>
            <h4 className="text-sm font-bold text-[#08243D]">Bảo hiểm thú cưng & CSKH VIP</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bảo hiểm sự cố trong suốt ca chăm sóc lên đến 20.000.000 đ. Đường dây nóng hỗ trợ và xử lý khiếu nại siêu tốc trong 2 giờ.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Comparison Matrix */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#08243D]">Bảng so sánh chi tiết quyền lợi</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh sự khác biệt giữa tài khoản thường và các hạng gói hội viên PetCare
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#08243D]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Đã bao gồm đặc quyền
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 font-bold">
                <th className="py-3.5 px-6 min-w-[220px]">Quyền lợi / Tiêu chí</th>
                <th className="py-3.5 px-4 text-center min-w-[120px] text-slate-500 font-medium">Tài khoản thường</th>
                <th className="py-3.5 px-4 text-center min-w-[140px] text-[#08243D]">Gói Cơ Bản (99k)</th>
                <th className="py-3.5 px-4 text-center min-w-[160px] bg-[#08243D] text-[#F7C948]">
                  Gói VIP Pro (249k)
                  <span className="block text-[9px] font-normal text-slate-300">Được chọn nhiều nhất</span>
                </th>
                <th className="py-3.5 px-4 text-center min-w-[150px] text-[#08243D]">Gói Năm (1.990k)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-[#08243D]">{row.feature}</td>
                  <td className="py-3.5 px-4 text-center text-slate-500">{row.free}</td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-700">{row.basic}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-[#08243D] bg-amber-50/30">{row.premium}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-[#08243D]">{row.yearly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. FAQ Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 space-y-5 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            Giải Đáp Thắc Mắc
          </div>
          <h3 className="text-lg font-bold text-[#08243D] mt-2">Câu hỏi thường gặp về Gói Hội Viên</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4 space-y-1.5">
              <h4 className="text-xs md:text-sm font-bold text-[#08243D] flex items-start gap-2">
                <span className="text-amber-500 shrink-0 font-extrabold">Q:</span>
                {faq.question}
              </h4>
              <p className="text-xs text-slate-600 pl-5 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Lịch sử mua gói */}
      <div className="rounded-3xl border border-slate-200/70 bg-white shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#08243D]">Lịch sử mua gói</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi trạng thái đơn, xem lại mã QR chuyển khoản hoặc thanh toán lại các đơn đang chờ
            </p>
          </div>

          {myOrders.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { key: 'ALL', label: `Tất cả (${myOrders.length})` },
                  { key: 'PENDING', label: `Chờ thanh toán (${myOrders.filter((o) => o.status === 'PENDING').length})` },
                  { key: 'PAID', label: `Đã thanh toán (${myOrders.filter((o) => o.status === 'PAID').length})` },
                  { key: 'CANCELLED', label: `Đã huỷ (${myOrders.filter((o) => o.status === 'CANCELLED').length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setOrderFilter(tab.key)}
                  className={`rounded-xl px-3 py-1.5 text-[11px] font-bold transition-colors cursor-pointer ${
                    orderFilter === tab.key
                      ? 'bg-[#08243D] text-[#F7C948]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            {myOrders.length === 0
              ? 'Bạn chưa có giao dịch đăng ký gói hội viên nào.'
              : 'Không có đơn mua gói nào ở trạng thái này.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3 text-left">Mã đơn / Ngày tạo</th>
                  <th className="px-5 py-3 text-left">Gói & Kỳ hạn</th>
                  <th className="px-5 py-3 text-right">Số tiền</th>
                  <th className="px-5 py-3 text-left">Phương thức</th>
                  <th className="px-5 py-3 text-left">Nội dung CK / Giao dịch</th>
                  <th className="px-5 py-3 text-left">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.map((o) => {
                  const copyValue = o.transferContent || o.paymentCode;
                  const isBlockedByOtherActive = Boolean(mySubscription && mySubscription.planCode !== o.planCode);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-[#08243D]">{o.paymentCode}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{formatDateTime(o.createdAt)}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-[#08243D]">{o.planName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {formatPlanPeriod(o.durationDays)} ({o.durationDays} ngày) · Mã {o.planCode}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-[#08243D] tabular-nums whitespace-nowrap">
                        {formatPrice(o.amount)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {METHOD_LABEL[o.method]}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-2 py-1">
                            {copyValue}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(o.id, copyValue)}
                            title="Sao chép nội dung chuyển khoản"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#08243D] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                          >
                            {copiedId === o.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {o.paidAt && (
                          <div className="text-[11px] text-emerald-600 font-medium mt-1">
                            Đã thanh toán: {formatDateTime(o.paidAt)}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-semibold ${ORDER_STATUS[o.status].badge}`}
                        >
                          {ORDER_STATUS[o.status].label}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        {o.status === 'PENDING' ? (
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={isBlockedByOtherActive}
                              onClick={() => handleResumePayment(o)}
                              title={
                                isBlockedByOtherActive
                                  ? 'Bạn đang dùng gói khác còn hạn'
                                  : o.method === 'BANK_TRANSFER'
                                    ? 'Mở lại mã VietQR để chuyển khoản'
                                    : 'Tiếp tục thanh toán đơn này'
                              }
                              className="inline-flex items-center gap-1 rounded-xl bg-[#08243D] px-3 py-1.5 text-[11px] font-bold text-[#F7C948] hover:bg-[#0c3254] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {o.method === 'BANK_TRANSFER' ? (
                                <>
                                  <QrCode className="w-3.5 h-3.5" />
                                  Thanh toán (QR)
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-3.5 h-3.5" />
                                  Thanh toán lại
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={isBlockedByOtherActive}
                              onClick={() => handleChangeMethod(o)}
                              title="Đổi sang phương thức thanh toán khác (VietQR / Ví PetCare / VNPay)"
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#08243D] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Đổi PT
                            </button>

                            <button
                              type="button"
                              disabled={checkingOrderId === o.id}
                              onClick={() => handleCheckStatus(o)}
                              title="Kiểm tra trạng thái thanh toán ngay"
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#08243D] transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {checkingOrderId === o.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={cancellingOrderId === o.id}
                              onClick={() => setConfirmCancelOrder(o)}
                              title="Huỷ thanh toán đơn này"
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Huỷ
                            </button>
                          </div>
                        ) : o.status === 'CANCELLED' ? (
                          <button
                            type="button"
                            disabled={isBlockedByOtherActive}
                            onClick={() => openModal(o.planCode, { method: o.method })}
                            title={
                              isBlockedByOtherActive
                                ? 'Bạn đang dùng gói khác còn hạn'
                                : 'Tạo đơn đăng ký mới cho gói này'
                            }
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-[#08243D] hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Đăng ký lại
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isBlockedByOtherActive}
                            onClick={() => openModal(o.planCode, { method: o.method })}
                            className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100/60 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Gia hạn thêm
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Cancel Order Modal */}
      {confirmCancelOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl border border-slate-200/70 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#08243D]">Huỷ đơn thanh toán gói hội viên?</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bạn sắp huỷ đơn <strong className="font-mono text-[#08243D]">{confirmCancelOrder.paymentCode}</strong> mua{' '}
                  <strong>{confirmCancelOrder.planName}</strong> ({formatPrice(confirmCancelOrder.amount)}).
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-3.5 text-xs text-slate-600 leading-relaxed">
              Nếu bạn đã chuyển khoản vào mã này trước khi huỷ, hệ thống vẫn sẽ tự động hoàn 100% số tiền vào{' '}
              <strong className="text-[#08243D]">Ví PetCare</strong> của bạn.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={cancellingOrderId === confirmCancelOrder.id}
                onClick={() => setConfirmCancelOrder(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Giữ lại đơn
              </button>
              <button
                type="button"
                disabled={cancellingOrderId === confirmCancelOrder.id}
                onClick={handleConfirmCancelOrder}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancellingOrderId === confirmCancelOrder.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Xác nhận huỷ thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Biên Lai Xác Nhận Thanh Toán Gói Thành Viên Thành Công */}
      {paidOrderPopup && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#041320]/75 p-4 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200/80 animate-scale-up">
              <div className="relative overflow-hidden bg-[#08243D] px-6 py-7 text-center text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(247,201,72,0.18),transparent_70%)] pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/40 mb-3">
                    <span className="absolute inset-0 rounded-full bg-emerald-400/25 animate-ping" />
                    <CheckCircle2 className="h-9 w-9 text-emerald-400 relative z-10" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7C948]/15 border border-[#F7C948]/40 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#F7C948] mb-2">
                    <Sparkles className="w-3 h-3" />
                    VIP Membership Activated
                  </span>
                  <h4 className="text-xl font-bold text-white">
                    Thanh Toán Gói Thành Viên Thành Công!
                  </h4>
                  <p className="mt-1 text-xs text-slate-300 max-w-sm leading-relaxed">
                    Đặc quyền <strong className="text-[#F7C948]">{paidOrderPopup.planName}</strong> đã được kích hoạt vào tài khoản của bạn.
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-200/70">
                    <span className="text-slate-500 font-medium">Số tiền đã thanh toán</span>
                    <span className="text-lg font-black text-emerald-600 tabular-nums">
                      {formatPrice(paidOrderPopup.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-medium">Gói thành viên</span>
                    <span className="font-bold text-[#08243D]">
                      {paidOrderPopup.planName} ({paidOrderPopup.planCode})
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-medium">Thời hạn gói</span>
                    <span className="font-semibold text-slate-800">
                      +{paidOrderPopup.durationDays} ngày sử dụng
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-medium">Mã đơn thanh toán</span>
                    <span className="font-mono font-bold text-[#08243D] bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                      {paidOrderPopup.paymentCode}
                    </span>
                  </div>

                  {paidOrderPopup.transferContent && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium shrink-0">Nội dung CK</span>
                      <span className="font-mono text-[11px] font-semibold text-slate-700 text-right break-all">
                        {paidOrderPopup.transferContent}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 font-medium">Phương thức</span>
                    <span className="font-semibold text-slate-800">
                      {METHOD_LABEL[paidOrderPopup.method]}
                    </span>
                  </div>

                  {mySubscription?.expiresAt && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500 font-medium">Hiệu lực đến ngày</span>
                      <span className="font-bold text-teal-700">
                        {formatDate(mySubscription.expiresAt)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500 font-medium">Trạng thái</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      ĐÃ THANH TOÁN & KÍCH HOẠT
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPaidOrderPopup(null);
                      router.push('/bookings?view=new');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#08243D] py-3.5 px-4 text-xs font-bold text-[#F7C948] hover:bg-[#0c3254] transition-colors cursor-pointer"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Đặt lịch ngay để hưởng ưu đãi
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidOrderPopup(null)}
                    className="rounded-xl border border-slate-200 bg-white py-3.5 px-6 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      <SubscriptionModal />
    </div>
  );
}



