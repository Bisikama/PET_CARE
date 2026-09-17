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
    };
    booking_services?: Array<{
      provider_services?: {
        services?: {
          title: string;
        }
      }
    }>
  }>;
  estimated_start_at: string;
  location_type: string;
}

export const bookingsApi = {
  getActiveBooking: async (): Promise<ActiveBooking | null> => {
    try {
      const { data } = await apiClient.get('/bookings/active');
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
