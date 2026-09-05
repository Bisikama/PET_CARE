import { useCallback, useEffect, useState } from 'react';
import { useCustomerBookingStore } from '../stores/useCustomerBookingStore';
import { useWalletStore } from '@/features/wallets/stores/useWalletStore';
import { bookingService } from '../services/booking.service';
import { CancelBookingPayload, CancelReason } from '../types';

/**
 * Hook lấy danh sách bookings của customer hiện tại (có cache store)
 */
export const useCustomerBookings = () => {
  const { bookings, isLoading, isFetched, setBookings, setLoading, setError } =
    useCustomerBookingStore();

  const fetchBookings = useCallback(
    async (force = false) => {
      if (isFetched && !force) return;
      try {
        setLoading(true);
        const data = await bookingService.getMyBookings();
        setBookings(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Không thể tải danh sách booking');
      } finally {
        setLoading(false);
      }
    },
    [isFetched, setBookings, setLoading, setError],
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    refreshBookings: () => fetchBookings(true),
  };
};

/**
 * Hook hủy booking - sau khi hủy thành công, backend tự hoàn tiền vào ví.
 * Hook sẽ: cập nhật booking trong store + invalidate cache ví để lần sau refresh tự lấy số dư mới.
 */
export const useCancelBooking = () => {
  const { updateBooking } = useCustomerBookingStore();
  // Invalidate wallet cache để force-refresh số dư sau khi hoàn tiền
  const { clearStore: clearWalletStore } = useWalletStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBooking = async (
    bookingId: string,
    reason: CancelReason = 'CUSTOMER_REQUEST',
    note?: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: CancelBookingPayload = { reason, note };
      const updated = await bookingService.cancelBooking(bookingId, payload);
      // Cập nhật booking trong list ngay lập tức (optimistic)
      updateBooking(updated);
      // Xóa cache ví → lần sau useWallet sẽ fetch lại số dư đã được cộng thêm
      clearWalletStore();
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể hủy booking');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { cancelBooking, isLoading, error };
};
