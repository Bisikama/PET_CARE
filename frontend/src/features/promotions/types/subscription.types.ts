/** Gói hội viên đang mở bán (giá do admin cấu hình). */
export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface UserSubscription {
  id: string;
  planCode: string;
  planName: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startsAt: string;
  currentPeriodEndsAt: string;
  /** Hết hạn sau cùng, đã tính các kỳ gia hạn trả trước */
  expiresAt: string;
}

export type SubscriptionOrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type SubscriptionPaymentMethod = 'BANK_TRANSFER' | 'VNPAY' | 'WALLET';

export interface SubscriptionOrder {
  id: string;
  planCode: string;
  planName: string;
  amount: number;
  durationDays: number;
  method: SubscriptionPaymentMethod;
  status: SubscriptionOrderStatus;
  paymentCode: string;
  transferContent: string | null;
  paidAt: string | null;
  createdAt: string;
}

/** Thông tin chuyển khoản VietQR khi mua gói. */
export interface SubscriptionBankTransferCheckout {
  orderId: string;
  planCode: string;
  planName: string;
  durationDays: number;
  paymentCode: string;
  amount: number;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  /** VD: "PCABCD234567 Thanh toan goi BASIC" */
  transferContent: string;
  qrImageUrl: string;
}

export interface SubscriptionCheckoutDto {
  planCode: string;
}

// ---- Admin ----

export interface AdminSubscriptionPlan extends SubscriptionPlan {
  createdAt: string;
  updatedAt: string;
  stats: {
    soldCount: number;
    revenue: number;
    pendingOrders: number;
    activeSubscribers: number;
  };
}

export interface SubscriptionPlanInput {
  code?: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  benefits: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface AdminSubscriptionOrder extends SubscriptionOrder {
  gatewayRef: string | null;
  customer: { id: string; fullName: string; email: string } | null;
  subscription: { startDate: string; endDate: string; status: string } | null;
}

export interface AdminSubscriptionOrderList {
  items: AdminSubscriptionOrder[];
  total: number;
  page: number;
  limit: number;
  summary: Record<SubscriptionOrderStatus, { count: number; amount: number }>;
}
