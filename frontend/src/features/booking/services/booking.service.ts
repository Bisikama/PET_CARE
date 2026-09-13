import axiosInstance from '@/lib/axios';
import { Booking, CancelBookingPayload } from '../types';

export const bookingService = {
  createBooking: async (bookingData: any): Promise<any> => {
    const response = await axiosInstance.post('/bookings', bookingData);
    return response.data;
  },

  getBooking: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách booking của customer hiện tại
   */
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await axiosInstance.get('/bookings');
    return response.data.data || response.data;
  },

  /**
   * Customer hủy booking → backend tự động hoàn tiền vào ví
   */
  cancelBooking: async (bookingId: string, payload: CancelBookingPayload): Promise<Booking> => {
    const response = await axiosInstance.post(`/bookings/${bookingId}/cancel`, payload);
    return response.data.data || response.data;
  },

  getPricingRules: async (serviceId: string): Promise<any[]> => {
    const response = await axiosInstance.get(`/services/${serviceId}/pricing-rules`);
    return response.data;
  },

  discoverProviders: async (params: {
    serviceId: string;
    petId?: string;
    species?: string;
    weight?: number;
    addressId?: string;
    city?: string;
    district?: string;
    ward?: string;
    date?: string;
    priceMin?: number;
    priceMax?: number;
    ratingMin?: number;
    hasTrustBadge?: boolean;
  }): Promise<any[]> => {
    const response = await axiosInstance.get('/service-discovery/providers', { params });
    return response.data;
  },

  calculatePrice: async (dto: any): Promise<any> => {
    const response = await axiosInstance.post('/bookings/calculate-price', dto);
    return response.data;
  },

  searchMatchingProviders: async (dto: any): Promise<any[]> => {
    const response = await axiosInstance.post('/booking-matching/search', dto);
    return response.data;
  },

  providerCancelBooking: async (bookingId: string, payload: { reason: string; note?: string }): Promise<any> => {
    const response = await axiosInstance.post(`/bookings/${bookingId}/provider-cancel`, payload);
    return response.data;
  },

  getBookingChecklist: async (bookingId: string): Promise<any> => {
    const response = await axiosInstance.get(`/bookings/${bookingId}/checklist`);
    return response.data;
  },

  updateChecklistItem: async (bookingId: string, itemId: string, data: any): Promise<any> => {
    const response = await axiosInstance.patch(`/bookings/${bookingId}/checklist/${itemId}`, data);
    return response.data;
  },

  createBookingReview: async (bookingId: string, data: { rating: number; comment?: string }): Promise<any> => {
    const response = await axiosInstance.post(`/bookings/${bookingId}/reviews`, data);
    return response.data;
  },

  createBookingDispute: async (bookingId: string, data: { reason: string; description: string }): Promise<any> => {
    const response = await axiosInstance.post(`/bookings/${bookingId}/dispute`, data);
    return response.data;
  },

  requestBookingExtension: async (bookingId: string, data: { additionalMinutes: number; reason: string }): Promise<any> => {
    const response = await axiosInstance.patch(`/bookings/${bookingId}/request-extension`, data);
    return response.data;
  },
};

