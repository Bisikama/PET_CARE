export interface Promotion {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  min_order_value: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePromotionInput {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdatePromotionInput {
  code?: string;
  discount_percent?: number | null;
  discount_amount?: number | null;
  min_order_value?: number | null;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface ValidatePromotionInput {
  code: string;
  orderValue: number;
}

export interface ValidatePromotionResult {
  isValid: boolean;
  promotionId: string;
  code: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}
