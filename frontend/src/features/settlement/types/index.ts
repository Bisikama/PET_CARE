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
