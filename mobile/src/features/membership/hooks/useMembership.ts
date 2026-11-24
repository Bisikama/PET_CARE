import { useCallback, useEffect, useRef, useState } from 'react';
import {
  paymentsApi,
  subscriptionsApi,
  type MySubscription,
  type SubscriptionOrder,
  type SubscriptionOrderStatus,
  type SubscriptionPlan,
} from '@/infrastructure/api';

/** Gói đang bán, gói đang dùng, lịch sử mua và số dư ví của khách. */
export function useMembership() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [mySubscription, setMySubscription] = useState<MySubscription | null>(null);
  const [orders, setOrders] = useState<SubscriptionOrder[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    setError(null);
    try {
      const [plansRes, subRes, ordersRes, walletRes] = await Promise.all([
        subscriptionsApi.getPlans(),
        subscriptionsApi.getMySubscription().catch(() => null),
        subscriptionsApi.getMyOrders().catch(() => [] as SubscriptionOrder[]),
        paymentsApi.getMyWallet().catch(() => null),
      ]);
      setPlans(plansRes);
      setMySubscription(subRes);
      setOrders(ordersRes);
      setWalletBalance(walletRes ? walletRes.balance : null);
    } catch (e: any) {
      setError(e?.message || 'Không tải được danh sách gói.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    plans,
    mySubscription,
    orders,
    walletBalance,
    isLoading,
    isRefreshing,
    error,
    reload: load,
    refresh: () => load(true),
  };
}

const POLL_MS = 4000;

/** Hỏi định kỳ trạng thái đơn mua gói trong lúc khách chuyển khoản. */
export function useSubscriptionOrderStatus(orderId: string | null) {
  const [status, setStatus] = useState<SubscriptionOrderStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const statusRef = useRef<SubscriptionOrderStatus | null>(null);

  const fetchStatus = useCallback(async (): Promise<SubscriptionOrderStatus | null> => {
    if (!orderId) return null;
    try {
      const order = await subscriptionsApi.getMyOrder(orderId);
      statusRef.current = order.status;
      setStatus(order.status);
      return order.status;
    } catch {
      return statusRef.current;
    }
  }, [orderId]);

  useEffect(() => {
    statusRef.current = null;
    setStatus(null);
    if (!orderId) return;
    const timer = setInterval(() => {
      if (statusRef.current === null || statusRef.current === 'PENDING') fetchStatus();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [orderId, fetchStatus]);

  const checkNow = useCallback(async () => {
    setIsChecking(true);
    try {
      return await fetchStatus();
    } finally {
      setIsChecking(false);
    }
  }, [fetchStatus]);

  return { status, isChecking, checkNow };
}
