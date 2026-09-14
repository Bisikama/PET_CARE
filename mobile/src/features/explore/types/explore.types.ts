import { ApiResponse } from '../../auth/types/auth.types';

export interface BookingSearchRequest {
  service_type: string;
  latitude: number;
  longitude: number;
  date: string;
  start_time?: string;
  end_time?: string;
}

export interface ProviderSearchResult {
  provider_id: string;
  full_name: string;
  avatar_url?: string;
  distance_meters: number;
  rating: number;
  review_count: number;
  price_per_hour: number;
  services: string[];
}
