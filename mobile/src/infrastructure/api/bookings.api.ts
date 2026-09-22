import { apiClient } from './client';

export interface ActiveBooking {
  id: string;
  status: string;
  provider_profiles?: {
    is_verified: boolean;
    users?: {
      fullName: string;
      avatarUrl: string;
    };
  };
  booking_pets?: Array<{
    pets?: {
      name: string;
      breed: string;
      avatar_url?: string;
    };
    booking_services?: Array<{
      provider_services?: {
        services?: {
          title: string;
          name?: string;
        };
      };
    }>;
  }>;
  estimated_start_at: string;
  location_type: string;
}

export interface BookingListItem {
  id: string;
  booking_code: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' | string;
  total_amount: number;
  grand_total?: number;
  payment_method?: string;
  payment_status?: string;
  booking_date?: string;
  start_time?: string;
  created_at: string;
  location_type?: string;
  notes?: string;
  customer_addresses?: {
    address_line?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  provider_profiles?: {
    id?: string;
    is_verified?: boolean;
    rating?: number;
    users?: {
      id?: string;
      fullName?: string;
      avatarUrl?: string;
      phone?: string;
    };
  };
  booking_pets?: Array<{
    pets?: {
      id?: string;
      name?: string;
      breed?: string;
      species?: string;
      avatar_url?: string;
      weight?: number;
    };
    booking_services?: Array<{
      price?: number;
      provider_services?: {
        services?: {
          id?: string;
          title?: string;
          name?: string;
        };
      };
    }>;
  }>;
}

export interface GetBookingsResponse {
  data: BookingListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CalculatePriceRequest {
  petId: string;
  serviceId: string;
  addressId: string;
  providerId: string;
  promoCode?: string;
}

export interface CalculatePriceResponse {
  basePrice: number;
  servicePrice: number;
  travelFee: number;
  distanceKm: number;
  discountAmount: number;
  promoCode?: string;
  finalPrice: number;
}

export interface CreateBookingRequest {
  petId: string;
  providerWorkingSlotId: string;
  addressId: string;
  serviceId: string;
  customerNote?: string;
  promoCode?: string;
}

export interface CreateBookingResponse {
  booking: any;
  paymentUrl?: string;
}

export interface SearchMatchingProvidersRequest {
  petId: string;
  serviceId: string;
  addressId: string;
  date: string;
}

export interface MatchedProviderResponse {
  providerId: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  ratingAvg: number;
  totalCompletedBookings: number;
  servicePrice: number;
  slots: Array<{
    providerWorkingSlotId: string;
    slotId: string;
    name: string;
    startTime: string;
    endTime: string;
  }>;
  recommendationReasons: string[];
  score: number;
}

export const bookingsApi = {
  getActiveBooking: async (): Promise<ActiveBooking | null> => {
    try {
      const { data } = await apiClient.get('/bookings/active');
      return data?.data !== undefined ? data.data : data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getBookings: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<GetBookingsResponse> => {
    const { data } = await apiClient.get('/bookings', { params });
    return data?.data !== undefined ? data.data : data;
  },

  getBookingById: async (id: string): Promise<BookingListItem> => {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return data?.data !== undefined ? data.data : data;
  },

  cancelBooking: async (id: string, reason?: string): Promise<{ success: boolean; message?: string }> => {
    const { data } = await apiClient.post(`/bookings/${id}/cancel`, { reason });
    return data?.data !== undefined ? data.data : data;
  },

  customerConfirm: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post(`/bookings/${id}/customer-confirm`);
    return data?.data !== undefined ? data.data : data;
  },

  calculatePrice: async (dto: CalculatePriceRequest): Promise<CalculatePriceResponse> => {
    const { data } = await apiClient.post('/bookings/calculate-price', dto);
    return data?.data !== undefined ? data.data : data;
  },

  createBooking: async (dto: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const { data } = await apiClient.post('/bookings', dto);
    return data?.data !== undefined ? data.data : data;
  },

  searchMatchingProviders: async (dto: SearchMatchingProvidersRequest): Promise<MatchedProviderResponse[]> => {
    const { data } = await apiClient.post('/booking-matching/search', dto);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  getAvailableSlots: async (providerId: string, startDate?: string, endDate?: string): Promise<any> => {
    const { data } = await apiClient.get(`/provider-schedules/available-slots/${providerId}`, {
      params: { startDate, endDate },
    });
    return data?.data !== undefined ? data.data : data;
  },

  getTimeSlots: async (): Promise<Array<{ id: string; name: string; start_time: string; end_time: string; slot_order: number }>> => {
    const { data } = await apiClient.get('/time-slots');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },
};
