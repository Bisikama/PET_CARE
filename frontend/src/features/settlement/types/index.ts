export interface PayoutRequest {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  bankName: string;
  accountNumber: string;
  accountName: string;
  requestedAt: string;
  resolvedAt?: string;
}

// ---------------------------------------------------------------------------
// Giao dịch ngân hàng (SePay báo về tài khoản MB)
// ---------------------------------------------------------------------------

export type BankTransactionStatus =
  | 'MATCHED'
  | 'REFUNDED_TO_WALLET'
  | 'UNMATCHED'
  | 'IGNORED'
  | 'RESOLVED_MANUALLY';

export interface BankTransaction {
  id: string;
  external_id: string;
  gateway: string | null;
  account_number: string | null;
  transaction_date: string | null;
  transfer_type: string;
  transfer_amount: string | number;
  content: string | null;
  code: string | null;
  reference_code: string | null;
  status: BankTransactionStatus;
  note: string | null;
  payment_id: string | null;
  resolved_at: string | null;
  created_at: string;
  resolver: { id: string; fullName: string; email: string } | null;
  payments: { booking_id: string; amount: string | number; status: string } | null;
}

export interface BankTransactionList {
  items: BankTransaction[];
  total: number;
  page: number;
  limit: number;
  summary: Record<BankTransactionStatus, { count: number; amount: number }>;
}

export type ResolveBankTransactionInput =
  | { action: 'ASSIGN'; paymentCode?: string; bookingId?: string; reason: string }
  | { action: 'CREDIT_WALLET'; customerEmail: string; reason: string }
  | { action: 'MARK_RESOLVED'; reason: string };
