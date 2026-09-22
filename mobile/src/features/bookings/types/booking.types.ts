export interface BookingDraft {
  serviceId?: string;
  serviceTitle?: string;
  serviceCategory?: string;
  serviceDurationMinutes?: number;
  basePrice?: number;
  selectedSizeId?: string;
  selectedAddonIds?: string[];
  
  petId?: string;
  petName?: string;
  petSpecies?: string;
  petBreed?: string;
  petAge?: number;
  petWeight?: number;
  petGender?: string;
  petAvatarUrl?: string;

  bookingDate?: string; // YYYY-MM-DD
  timeSlot?: string;    // e.g. "07:00 - 09:00"
  timeSlotName?: string;
  slotId?: string;
  slotStartTime?: string;
  slotEndTime?: string;

  providerId?: string;
  providerName?: string;
  providerAvatar?: string;
  providerRating?: number;
  providerWorkingSlotId?: string;

  addressId?: string;
  addressLine?: string;
  fullAddress?: string;

  servicePrice?: number;
  travelFee?: number;
  distanceKm?: number;
  discountAmount?: number;
  totalPrice?: number;
  promoCode?: string;
  customerNote?: string;
  paymentMethod?: PaymentMethodType;
}

export interface SelectablePet {
  id: string;
  name: string;
  species: 'Dog' | 'Cat' | string;
  breed: string;
  age: number;
  weight: number;
  gender: 'Male' | 'Female' | string;
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
  startTime?: string;
  endTime?: string;
  name?: string;
  slotOrder?: number;
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
  providerWorkingSlotId?: string;
}

export type PaymentMethodType = 'WALLET' | 'VIETQR' | 'VNPAY' | 'MOMO' | 'CARD' | 'CASH';

export interface VoucherItem {
  code: string;
  title: string;
  description: string;
  discountType: 'FIXED' | 'PERCENT';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  expiryDate: string;
}

export interface BookingReviewParams {
  serviceId?: string;
  serviceTitle?: string;
  providerId?: string;
  providerName?: string;
  providerAvatar?: string;
  providerRating?: string;
  petId?: string;
  petName?: string;
  petBreed?: string;
  petAvatarUrl?: string;
  petWeight?: string;
  day?: string;
  slotTime?: string;
  basePrice?: string;
  selectedSizeId?: string;
  selectedAddonIds?: string;
}
