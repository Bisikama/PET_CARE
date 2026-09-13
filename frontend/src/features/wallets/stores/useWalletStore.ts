import { create } from 'zustand';
import { Wallet, WalletTransaction, PayoutRequest } from '../types/wallet.types';

interface WalletState {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  payoutRequests: PayoutRequest[];
  isLoading: boolean;
  isWalletFetched: boolean;
  isTransactionsFetched: boolean;
  isPayoutRequestsFetched: boolean;
  error: string | null;
  
  // Actions
  setWallet: (wallet: Wallet) => void;
  setTransactions: (transactions: WalletTransaction[]) => void;
  setPayoutRequests: (payoutRequests: PayoutRequest[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  addPayoutRequest: (request: PayoutRequest) => void;
  clearStore: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  transactions: [],
  payoutRequests: [],
  isLoading: false,
  isWalletFetched: false,
  isTransactionsFetched: false,
  isPayoutRequestsFetched: false,
  error: null,

  setWallet: (wallet) => set({ wallet, isWalletFetched: true, error: null }),
  setTransactions: (transactions) => set({ transactions, isTransactionsFetched: true, error: null }),
  setPayoutRequests: (payoutRequests) => set({ payoutRequests, isPayoutRequestsFetched: true, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  addPayoutRequest: (request) => set((state) => ({ 
    payoutRequests: [request, ...state.payoutRequests] 
  })),
  clearStore: () => set({ 
    wallet: null, 
    transactions: [], 
    payoutRequests: [], 
    isWalletFetched: false, 
    isTransactionsFetched: false, 
    isPayoutRequestsFetched: false, 
    error: null 
  }),
}));
