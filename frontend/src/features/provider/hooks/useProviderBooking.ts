import { useCallback } from 'react';
import { providerBookingService } from '../services/provider-booking.service';
import { useProviderBookingStore } from '../stores/provider-booking.store';

export const useProviderBooking = (bookingId?: string) => {
  const { 
    bookingDetail, 
    isLoading, 
    error, 
    setBookingDetail, 
    setLoading, 
    setError,
    clearBookingDetail
  } = useProviderBookingStore();

  const fetchBookingDetail = useCallback(async (id: string, force = false) => {
    // Return cached if we already have it and it's the same booking, unless forced
    if (bookingDetail?.id === id && !force) {
      return;
    }

    if (!bookingDetail) {
      setLoading(true);
    }
    try {
      const data = await providerBookingService.getBookingById(id);
      setBookingDetail(data);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Lỗi khi tải thông tin đơn đặt lịch';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [bookingDetail, setBookingDetail, setLoading, setError]);

  const fetchActiveBooking = useCallback(async () => {
    if (!bookingDetail) {
      setLoading(true);
    }
    try {
      const activeData = await providerBookingService.getActiveBooking();
      if (activeData?.id) {
        // Fetch full detail including checklist items using GET /bookings/:id
        const fullDetail = await providerBookingService.getBookingById(activeData.id);
        setBookingDetail(fullDetail || activeData);
        return fullDetail || activeData;
      } else {
        clearBookingDetail();
        return null;
      }
    } catch (err: any) {
      console.error('Error fetching active booking:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [bookingDetail, setBookingDetail, clearBookingDetail, setLoading]);

  const acceptBooking = async (id: string) => {
    try {
      await providerBookingService.acceptBooking(id);
      // Refresh after accept
      await fetchBookingDetail(id, true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Lỗi khi chấp nhận đơn đặt lịch';
      setError(message);
    }
  };

  const rejectBooking = async (id: string) => {
    try {
      await providerBookingService.rejectBooking(id);
      // Refresh after reject
      await fetchBookingDetail(id, true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Lỗi khi từ chối đơn đặt lịch';
      setError(message);
    }
  };

  return {
    bookingDetail,
    isLoading,
    error,
    fetchBookingDetail,
    fetchActiveBooking,
    acceptBooking,
    rejectBooking,
    clearBookingDetail
  };
};
