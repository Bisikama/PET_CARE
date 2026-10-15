import { create } from 'zustand';
import { PayoutRequest } from '../types';
import { settlementService } from '../services/settlement.service';

interface SettlementState {
  payoutRequests: PayoutRequest[];
  isLoading: boolean;
  hasFetchedOnce: boolean;
  error: string | null;

  fetchPayoutRequests: (force?: boolean) => Promise<void>;
  approvePayout: (id: string) => Promise<void>;
  rejectPayout: (id: string, reason?: string) => Promise<void>;
  releaseEscrow: (bookingId: string) => Promise<void>;
  refundCustomer: (bookingId: string) => Promise<void>;
}

export const useSettlementStore = create<SettlementState>((set, get) => ({
  payoutRequests: [],
  isLoading: false,
  hasFetchedOnce: false,
  error: null,

  fetchPayoutRequests: async (force = false) => {
    const { hasFetchedOnce, isLoading } = get();
    if (isLoading || (hasFetchedOnce && !force)) return;

    set({ isLoading: true, error: null });
    try {
      const data = await settlementService.getPayoutRequests();
      const rawList = Array.isArray(data) ? data : (data as any)?.data || [];
      const requests = rawList.map((item: any) => {
        const bank = item.bank_details || {};
        return {
          id: item.id,
          providerId: item.provider_id || item.customer_id || '',
          providerName: bank.account_name || item.providerName || (item.provider_id ? `Đối tác #${item.provider_id.slice(0, 8)}` : 'Người dùng'),
          amount: Number(item.amount) || 0,
          status: item.status,
          bankName: bank.bank_name || item.bankName || 'N/A',
          accountNumber: bank.account_number || item.accountNumber || 'N/A',
          accountName: bank.account_name || item.accountName || 'N/A',
          requestedAt: item.created_at || item.requestedAt || '',
          resolvedAt: item.updated_at || item.resolvedAt,
          bank_details: item.bank_details,
        };
      });
      set({ payoutRequests: requests, isLoading: false, hasFetchedOnce: true });
    } catch (error: any) {
      set({ isLoading: false, error: error.message || 'Failed to fetch payout requests' });
      console.error('Fetch payout requests failed', error);
    }
  },

  approvePayout: async (id: string) => {
    try {
      await settlementService.approvePayout(id);
      set((state) => ({
        payoutRequests: state.payoutRequests.filter(req => req.id !== id)
      }));
    } catch (error) {
      console.error('Approve payout failed', error);
      throw error;
    }
  },

  rejectPayout: async (id: string, reason?: string) => {
    try {
      await settlementService.rejectPayout(id, reason);
      set((state) => ({
        payoutRequests: state.payoutRequests.filter(req => req.id !== id)
      }));
    } catch (error) {
      console.error('Reject payout failed', error);
      throw error;
    }
  },

  releaseEscrow: async (bookingId: string) => {
    try {
      await settlementService.releaseEscrow(bookingId);
    } catch (error) {
      console.error('Release escrow failed', error);
      throw error;
    }
  },

  refundCustomer: async (bookingId: string) => {
    try {
      await settlementService.refundCustomer(bookingId);
    } catch (error) {
      console.error('Refund customer failed', error);
      throw error;
    }
  }
}));
