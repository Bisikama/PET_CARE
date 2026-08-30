import { wallet_status, wallet_transaction_type, Prisma } from '@prisma/client';

export interface WalletRecord {
  id: string;
  user_id: string;
  balance: number | Prisma.Decimal;
  pending_balance: number | Prisma.Decimal;
  status: wallet_status | string;
  created_at: Date;
  updated_at: Date;
}

export interface WalletTransactionRecord {
  id: string;
  wallet_id: string;
  type: wallet_transaction_type | string;
  amount: number | Prisma.Decimal;
  balance_after: number | Prisma.Decimal;
  booking_id?: string | null;
  description?: string | null;
  created_at: Date;
}
