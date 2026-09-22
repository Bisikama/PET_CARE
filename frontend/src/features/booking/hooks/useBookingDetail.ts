import { useEffect } from 'react';
import { useBookingStore } from '../stores/booking.store';
import { bookingService } from '../services/booking.service';

export const useBookingDetail = (bookingId?: string) => {
  const {
    bookingDetailsMap,
    checklistsMap,
    isLoading,
    isSubmitting,
    error,
    fetchBookingDetail,
    fetchBookingChecklist,
  } = useBookingStore();

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail(bookingId);
      fetchBookingChecklist(bookingId);
    }
  }, [bookingId, fetchBookingDetail, fetchBookingChecklist]);

  const booking = bookingId ? bookingDetailsMap[bookingId] : null;
  const rawChecklist: any = bookingId ? checklistsMap[bookingId] : [];
  const checklist = Array.isArray(rawChecklist)
    ? rawChecklist
    : rawChecklist?.checklistItems || rawChecklist?.data?.checklistItems || [];

  const updateChecklistItem = async (itemId: string, data: any) => {
    if (!bookingId) return false;
    await bookingService.updateChecklistItem(bookingId, itemId, data);
    await fetchBookingChecklist(bookingId, true);
    return true;
  };

  const providerCancel = async (reason: string, note?: string) => {
    if (!bookingId) return false;
    await bookingService.providerCancelBooking(bookingId, { reason, note });
    await fetchBookingDetail(bookingId, true);
    return true;
  };

  const submitReview = async (rating: number, comment?: string) => {
    if (!bookingId) return false;
    await bookingService.createBookingReview(bookingId, { rating, comment });
    await fetchBookingDetail(bookingId, true);
    return true;
  };

  const submitDispute = async (reason: string, description: string) => {
    if (!bookingId) return false;
    await bookingService.createBookingDispute(bookingId, { reason, description });
    await fetchBookingDetail(bookingId, true);
    return true;
  };

  const requestExtension = async (minutes: number, reason: string) => {
    if (!bookingId) return false;
    await bookingService.requestBookingExtension(bookingId, { minutes, reason });
    await fetchBookingDetail(bookingId, true);
    return true;
  };

  return {
    booking,
    checklist,
    isLoading,
    isSubmitting,
    error,
    updateChecklistItem,
    providerCancel,
    submitReview,
    submitDispute,
    requestExtension,
    refetch: () => {
      if (bookingId) {
        fetchBookingDetail(bookingId, true);
        fetchBookingChecklist(bookingId, true);
      }
    },
  };
};
