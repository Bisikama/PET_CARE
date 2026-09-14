import { useEffect, useCallback } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { walletService } from '../services/wallet.service';


export const useWallet = (options?: { pollingIntervalMs?: number }) => {
  const { 
    wallet, 
    isLoading, 
    error, 
    isWalletFetched, 
    setWallet, 
    setLoading, 
    setError 
  } = useWalletStore();

  const fetchWallet = useCallback(async (silent = false) => {
    try {
      if (!silent && !isWalletFetched) {
        setLoading(true);
      }
      const data = await walletService.getMyWallet();
      setWallet(data);
    } catch (err: any) {
      if (!silent) {
        setError(err.response?.data?.message || 'Failed to fetch wallet');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [isWalletFetched, setWallet, setLoading, setError]);

  useEffect(() => {
    fetchWallet(false);
  }, [fetchWallet]);

  useEffect(() => {
    const intervalMs = options?.pollingIntervalMs || 10000;

    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchWallet(true);
      }
    }, intervalMs);

    const handleFocus = () => {
      fetchWallet(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, [fetchWallet, options?.pollingIntervalMs]);

  return { wallet, isLoading, error, refreshWallet: () => fetchWallet(false) };
};

export const useWalletTransactions = () => {
  const { 
    transactions, 
    isLoading, 
    isTransactionsFetched, 
    setTransactions, 
    setLoading, 
    setError 
  } = useWalletStore();

  const fetchTransactions = useCallback(async (force = false) => {
    if (isTransactionsFetched && !force) return;
    
    try {
      setLoading(true);
      const data = await walletService.getMyTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [isTransactionsFetched, setTransactions, setLoading, setError]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, refreshTransactions: () => fetchTransactions(true) };
};

export const usePayoutRequests = () => {
  const { 
    payoutRequests, 
    isLoading, 
    isPayoutRequestsFetched, 
    setPayoutRequests, 
    addPayoutRequest,
    setLoading, 
    setError 
  } = useWalletStore();

  const fetchPayoutRequests = useCallback(async (force = false) => {
    if (isPayoutRequestsFetched && !force) return;
    
    try {
      setLoading(true);
      const data = await walletService.getMyPayoutRequests();
      setPayoutRequests(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch payout requests');
    } finally {
      setLoading(false);
    }
  }, [isPayoutRequestsFetched, setPayoutRequests, setLoading, setError]);

  useEffect(() => {
    fetchPayoutRequests();
  }, [fetchPayoutRequests]);

  const requestPayout = async (amount: number) => {
    try {
      setLoading(true);
      const data = await walletService.requestProviderPayout(amount);
      addPayoutRequest(data);
      return true;
    } catch (err: any) {
      console.error('Payout request error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    payoutRequests, 
    isLoading, 
    refreshPayoutRequests: () => fetchPayoutRequests(true),
    requestPayout
  };
};
