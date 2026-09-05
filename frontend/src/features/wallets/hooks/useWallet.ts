import { useEffect, useCallback } from 'react';
import { useWalletStore } from '../stores/useWalletStore';
import { walletService } from '../services/wallet.service';


export const useWallet = () => {
  const { 
    wallet, 
    isLoading, 
    error, 
    isWalletFetched, 
    setWallet, 
    setLoading, 
    setError 
  } = useWalletStore();

  const fetchWallet = useCallback(async (force = false) => {
    if (isWalletFetched && !force) return;
    
    try {
      setLoading(true);
      const data = await walletService.getMyWallet();
      setWallet(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch wallet');
      window.alert('Không thể tải thông tin ví');
    } finally {
      setLoading(false);
    }
  }, [isWalletFetched, setWallet, setLoading, setError]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return { wallet, isLoading, error, refreshWallet: () => fetchWallet(true) };
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
      window.alert('Không thể tải lịch sử giao dịch');
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
      window.alert('Yêu cầu rút tiền thành công');
      return true;
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Rút tiền thất bại');
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
