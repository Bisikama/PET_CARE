export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  price: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

export interface SubscriptionCheckoutDto {
  planId: string;
  paymentMethod: 'VNPAY' | 'WALLET';
}
