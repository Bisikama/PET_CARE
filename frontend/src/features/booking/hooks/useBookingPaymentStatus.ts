import { useCallback, useEffect, useRef, useState } from 'react';
import { bookingService } from '../services/booking.service';

export type BookingPaymentState = 'PENDING' | 'PAID' | 'EXPIRED';

/** Đọc trạng thái thanh toán của booking từ backend — nguồn sự thật duy nhất. */
export async function fetchBookingPaymentState(bookingId: string): Promise<BookingPaymentState> {
  const res = await bookingService.getBooking(bookingId);
  const booking = res?.data?.booking || res?.data || res?.booking || res;
  const status: string | undefined = booking?.status;
  if (!status || status === 'PENDING_PAYMENT') return 'PENDING';
  if (status === 'EXPIRED' || status === 'CANCELLED') return 'EXPIRED';
  return 'PAID';
}

/**
 * Hỏi backend định kỳ xem booking đã được thanh toán chưa (SePay báo có -> backend xác nhận).
 * Dừng khi có kết quả cuối (PAID/EXPIRED) hoặc khi `enabled = false`.
 * Dùng cho một booking cố định — đổi booking thì mount lại component (ví dụ đặt `key={bookingId}`).
 */
export function useBookingPaymentStatus(bookingId: string | null, enabled: boolean, intervalMs = 4000) {
  const [state, setState] = useState<BookingPaymentState>('PENDING');
  const [isChecking, setIsChecking] = useState(false);
  // Kết quả cuối (PAID/EXPIRED) — đã có thì không hỏi backend nữa
  const finalRef = useRef<BookingPaymentState | null>(null);

  const check = useCallback(async (): Promise<BookingPaymentState> => {
    if (finalRef.current) return finalRef.current;
    if (!bookingId) return 'PENDING';
    try {
      const next = await fetchBookingPaymentState(bookingId);
      if (next !== 'PENDING') finalRef.current = next;
      setState(next);
      return next;
    } catch (err) {
      console.error('Không kiểm tra được trạng thái thanh toán', err);
      return 'PENDING';
    }
  }, [bookingId]);

  useEffect(() => {
    if (!enabled || !bookingId) return;
    const timer = setInterval(() => {
      if (!finalRef.current) void check();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, bookingId, intervalMs, check]);

  /** Khách bấm "Tôi đã chuyển khoản": kiểm tra ngay vài lần (không tự xác nhận). */
  const checkNow = useCallback(
    async (attempts = 5, delayMs = 3000): Promise<BookingPaymentState> => {
      setIsChecking(true);
      try {
        for (let i = 0; i < attempts; i++) {
          const result = await check();
          if (result !== 'PENDING') return result;
          if (i < attempts - 1) await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
        return 'PENDING';
      } finally {
        setIsChecking(false);
      }
    },
    [check],
  );

  return { state, isChecking, checkNow };
}
