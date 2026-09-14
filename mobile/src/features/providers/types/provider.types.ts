import { ApiResponse } from '../../auth/types/auth.types';

export interface ProviderScheduleSlot {
  id: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  is_blocked: boolean;
}

export interface ProviderReview {
  id: string;
  booking_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
}
