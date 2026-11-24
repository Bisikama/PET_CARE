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

export const DEFAULT_PLAN_BENEFITS: Record<string, string[]> = {
  BASIC: [
    'Giảm 5% cho tất cả đơn đặt lịch chăm sóc & tắm spa',
    'Miễn 100% phí dịch vụ nền tảng (Platform fee)',
    'Hỗ trợ quản lý hồ sơ sức khỏe cho tối đa 2 thú cưng',
    'Ưu tiên kết nối Chuyên viên đạt chuẩn 4-5 sao',
    'Nhắc lịch tiêm chủng, sổ giun tự động & ưu đãi độc quyền',
  ],
  PREMIUM: [
    'Giảm 15% không giới hạn cho mọi đơn đặt lịch',
    'Ưu tiên ghép cặp cao nhất (Priority Matching) giờ cao điểm & Lễ Tết',
    'Miễn phí tư vấn y tế & dinh dưỡng 24/7 với Bác sĩ Thú y qua Chat',
    'Bảo hiểm thú cưng trong suốt ca chăm sóc lên đến 5.000.000 đ',
    'Hỗ trợ hồ sơ không giới hạn số lượng thú cưng',
    'Đường dây nóng CSKH VIP & Xử lý khiếu nại ưu tiên trong 2 giờ',
  ],
  YEARLY: [
    'Toàn bộ tất cả đặc quyền của Gói VIP Pro',
    'Tiết kiệm 35% chi phí (tương đương chỉ ~165.000 đ/tháng)',
    'Tặng 02 lượt Tắm Spa hoặc Cắt tỉa lông miễn phí hàng năm',
    'Bảo hiểm an toàn thú cưng toàn diện lên đến 20.000.000 đ',
    'Đặc quyền giữ chỗ ưu tiên tuyệt đối vào dịp Lễ Tết Nguyên Đán',
    'Hộp quà tri ân sinh nhật thú cưng độc quyền từ PetCare',
  ],
};

export function getPlanBenefits(plan?: { code?: string; benefits?: string[] } | null): string[] {
  if (!plan) return [];
  if (plan.benefits && plan.benefits.length >= 3) {
    return plan.benefits;
  }
  const codeKey = (plan.code || '').toUpperCase();
  if (DEFAULT_PLAN_BENEFITS[codeKey]) {
    return DEFAULT_PLAN_BENEFITS[codeKey];
  }
  return plan.benefits && plan.benefits.length > 0 ? plan.benefits : ['Ưu đãi riêng dành cho hội viên PetCare'];
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
