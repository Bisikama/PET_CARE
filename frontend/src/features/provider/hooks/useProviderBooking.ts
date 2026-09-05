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

    setLoading(true);
    try {
      const data = await providerBookingService.getBookingById(id);
      setBookingDetail(data);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Lỗi khi tải thông tin đơn đặt lịch';
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  }, [bookingDetail?.id, setBookingDetail, setLoading, setError]);

  const acceptBooking = async (id: string) => {
    try {
      await providerBookingService.acceptBooking(id);
      alert('Đã chấp nhận đơn đặt lịch');
      // Refresh after accept
      await fetchBookingDetail(id, true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Lỗi khi chấp nhận đơn đặt lịch';
      alert(message);
    }
  };

  const rejectBooking = async (id: string) => {
    try {
      await providerBookingService.rejectBooking(id);
      alert('Đã từ chối đơn đặt lịch');
      // Refresh after reject
      await fetchBookingDetail(id, true);
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Lỗi khi từ chối đơn đặt lịch';
      alert(message);
    }
  };

  return {
    bookingDetail,
    isLoading,
    error,
    fetchBookingDetail,
    acceptBooking,
    rejectBooking,
    clearBookingDetail
  };
};
