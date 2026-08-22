import axiosInstance from '@/lib/axios';

export const bookingService = {
  createBooking: async (bookingData: any): Promise<any> => {
    const response = await axiosInstance.post('/bookings', bookingData);
    return response.data;
  },

  getPricingRules: async (serviceId: string): Promise<any[]> => {
    const response = await axiosInstance.get(`/services/${serviceId}/pricing-rules`);
    return response.data;
  },
};
