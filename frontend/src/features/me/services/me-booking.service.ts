import axiosInstance from '@/lib/axios';

export const meBookingService = {

  getBookingDetail: async (bookingId: string): Promise<any> => {
    const response = await axiosInstance.get(`/bookings/${bookingId}`);
    return response.data;
  },
  customerConfirmBooking: async (bookingId: string): Promise<any> => {
    const response = await axiosInstance.post(`/bookings/${bookingId}/customer-confirm`);
    return response.data;
  }
};
