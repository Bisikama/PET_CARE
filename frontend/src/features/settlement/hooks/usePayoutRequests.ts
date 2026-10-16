import { useEffect } from 'react';
import { useSettlementStore } from '../stores/settlement.store';

export const usePayoutRequests = () => {
  const { payoutRequests, isLoading, error, fetchPayoutRequests } = useSettlementStore();

  useEffect(() => {
    fetchPayoutRequests(true);
  }, [fetchPayoutRequests]);

  return { 
    payoutRequests, 
    isLoading, 
    error, 
    fetchPayoutRequests,
    refreshPayoutRequests: () => fetchPayoutRequests(true)
  };
};
