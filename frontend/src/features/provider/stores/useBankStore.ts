import { create } from 'zustand';
import { ProviderBankAccount } from '../types/bank.types';

interface BankStoreState {
  bankAccounts: ProviderBankAccount[];
  isLoading: boolean;
  isFetched: boolean;
  error: string | null;
  
  setBankAccounts: (accounts: ProviderBankAccount[]) => void;
  addBankAccount: (account: ProviderBankAccount) => void;
  updateBankAccount: (account: ProviderBankAccount) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearStore: () => void;
}

export const useBankStore = create<BankStoreState>((set) => ({
  bankAccounts: [],
  isLoading: false,
  isFetched: false,
  error: null,

  setBankAccounts: (accounts) => set({ bankAccounts: accounts, isFetched: true, error: null }),
  addBankAccount: (account) => set((state) => ({ 
    bankAccounts: [...state.bankAccounts, account] 
  })),
  updateBankAccount: (account) => set((state) => ({
    bankAccounts: state.bankAccounts.map(a => a.id === account.id ? account : a)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearStore: () => set({ bankAccounts: [], isFetched: false, error: null }),
}));
