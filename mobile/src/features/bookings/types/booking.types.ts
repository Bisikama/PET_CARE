export interface BookingDraft {
  serviceId?: string;
  serviceTitle?: string;
  providerId?: string;
  providerName?: string;
  totalPrice?: number;
  selectedSizeId?: string;
  selectedAddonIds?: string[];
  petId?: string;
  petName?: string;
  petAvatarUrl?: string;
  bookingDate?: string;
  timeSlot?: string;
  location?: string;
  notes?: string;
  paymentMethod?: 'WALLET' | 'VNPAY' | 'CASH';
}

export interface SelectablePet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat';
  breed: string;
  age: number;
  weight: number;
  gender: 'Male' | 'Female';
  avatarUrl: string;
  isVerified?: boolean;
  tierNote?: string;
  warningNote?: string;
}

export interface TimeSlotOption {
  id: string;
  time: string;
  period: string;
  isAvailable: boolean;
  isBooked?: boolean;
}

export interface CalendarDayItem {
  dayNumber: number;
  isPast: boolean;
  isAvailable: boolean;
  isCurrentMonth: boolean;
  dateString: string;
}

export interface MatchedProviderItem {
  id: string;
  name: string;
  avatarUrl: string;
  tagline: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  compatibilityScore?: number; // e.g. 98
  isBestChoice?: boolean;
  matchReasons: string[];
  price: number;
  priceSubtext: string;
  earliestSlot?: string;
  distanceKm?: number;
  isHomeVisit?: boolean;
}
