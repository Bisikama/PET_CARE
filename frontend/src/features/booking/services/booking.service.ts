import axiosInstance from '@/lib/axios';

export const bookingService = {
  createBooking: async (bookingData: any): Promise<any> => {
    const response = await axiosInstance.post('/bookings', bookingData);
    return response.data;
  },

  getBooking: async (id: string): Promise<any> => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
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
};

