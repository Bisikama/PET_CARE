export interface PayoutRequest {
  id: string;
  providerId?: string;
  providerName?: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAYOUT_PENDING' | 'PAID_OUT' | 'FAILED';
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  bank_details?: {
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    branch?: string;
  };
  requestedAt?: string;
  created_at?: string;
  resolvedAt?: string;
}
