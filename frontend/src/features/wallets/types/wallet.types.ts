export type WalletStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED';

export type WalletTransactionType =
  | 'DEPOSIT'
  | 'PAYOUT'
  | 'PAYMENT'
  | 'REFUND'
  | 'ESCROW_HOLD'
  | 'ESCROW_RELEASE'
  | 'FEE_DEDUCTION';

export type PayoutStatus =
  | 'PAYOUT_PENDING'
  | 'PAID_OUT'
  | 'PAYOUT_FAILED'
  | 'REJECTED';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  status: WalletStatus;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  type: WalletTransactionType;
  amount: number;
  balance_after: number;
  booking_id?: string | null;
  description?: string | null;
  created_at: string;
}

export interface PayoutRequest {
  id: string;
  provider_id?: string | null;
  customer_id?: string | null;
  amount: number;
  status: PayoutStatus;
  admin_note?: string | null;
  requested_at: string;
  processed_at?: string | null;
}
