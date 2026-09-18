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

export interface ExploreCategory {
  id: string;
  name: string;
  iconName: string;
}

export interface QuickFilterOption {
  id: string;
  label: string;
  iconName: string;
  active?: boolean;
}

export interface ExploreProviderItem {
  id: string;
  name: string;
  imageUrl: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  statusText: string;
  statusColor?: 'emerald' | 'amber' | 'navy';
  description: string;
  tags: string[];
  startingPrice: number;
  category: string;
  isFavorite?: boolean;
}
