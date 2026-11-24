import { useEffect } from 'react';
import { useSubscriptionStore } from '../stores/subscription.store';

/** Dữ liệu gói hội viên của khách: gói đang bán, gói đang dùng, lịch sử mua. */
export const useSubscription = () => {
  const store = useSubscriptionStore();
  const { fetchAll } = store;

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { ...store, refetch: store.fetchMySubscription };
};
