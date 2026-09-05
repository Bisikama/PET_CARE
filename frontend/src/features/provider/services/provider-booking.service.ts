import axiosInstance from '@/lib/axios';
import { ProviderBookingDetail } from '../types/booking';

export const providerBookingService = {
  getBookingById: async (id: string): Promise<ProviderBookingDetail> => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  },

  acceptBooking: async (id: string): Promise<any> => {
    const response = await axiosInstance.post(`/bookings/${id}/provider-accept`);
    return response.data;
  },

  rejectBooking: async (id: string): Promise<any> => {
    const response = await axiosInstance.post(`/bookings/${id}/provider-reject`);
    return response.data;
  },

  startService: async (id: string): Promise<any> => {
    const response = await axiosInstance.post(`/bookings/${id}/start-service`);
    return response.data;
  },

  updateChecklistItem: async (bookingId: string, itemId: string, data: { status: 'PENDING' | 'DONE' | 'SKIPPED', note?: string }): Promise<any> => {
    const response = await axiosInstance.patch(`/bookings/${bookingId}/checklist/${itemId}`, data);
    return response.data;
  },

  completeBooking: async (bookingId: string, data: { evidenceMedias: any[] }): Promise<any> => {
    const response = await axiosInstance.post(`/bookings/${bookingId}/complete`, data);
    return response.data;
  }
};
