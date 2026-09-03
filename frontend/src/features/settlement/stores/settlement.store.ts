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
  rejectPayout: (id: string) => Promise<void>;
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
      const requests = Array.isArray(data) ? data : (data as any).data || [];
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
        payoutRequests: state.payoutRequests.map(req => 
          req.id === id ? { ...req, status: 'APPROVED', resolvedAt: new Date().toISOString() } : req
        )
      }));
    } catch (error) {
      console.error('Approve payout failed', error);
      throw error;
    }
  },

  rejectPayout: async (id: string) => {
    try {
      await settlementService.rejectPayout(id);
      set((state) => ({
        payoutRequests: state.payoutRequests.map(req => 
          req.id === id ? { ...req, status: 'REJECTED', resolvedAt: new Date().toISOString() } : req
        )
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
