import { useCallback, useEffect, useRef, useState } from 'react';
import { subscriptionService } from '../services/subscription.service';
import type { SubscriptionOrderStatus } from '../types/subscription.types';

const POLL_MS = 4000;

/** Hỏi định kỳ trạng thái đơn mua gói trong lúc khách chuyển khoản. */
export function useSubscriptionOrderStatus(orderId: string | null) {
  const [status, setStatus] = useState<SubscriptionOrderStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const statusRef = useRef<SubscriptionOrderStatus | null>(null);

  const fetchStatus = useCallback(async (): Promise<SubscriptionOrderStatus | null> => {
    if (!orderId) return null;
    try {
      const order = await subscriptionService.getMyOrder(orderId);
      statusRef.current = order.status;
      setStatus(order.status);
      return order.status;
    } catch {
      return statusRef.current;
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    statusRef.current = null;
    setStatus(null);
    fetchStatus();
    const timer = setInterval(() => {
      if (statusRef.current === 'PENDING' || statusRef.current === null) fetchStatus();
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
