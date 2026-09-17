export enum ProviderType {
  SITTER = 'SITTER',
  GROOMER = 'GROOMER',
  VET = 'VET',
}

export interface CreateProviderProfileDto {
  providerType: ProviderType;
  bio?: string;
  experienceYears?: number;
}

export interface UpdateProviderAddressDto {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface AddServiceAreaDto {
  name: string;
  radiusKm: number;
  latitude: number;
  longitude: number;
}

export interface RegisterCapabilityDto {
  serviceId: string;
  basePrice: number;
  maxPets: number;
  isAvailable: boolean;
  notes?: string;
}

export interface SubmitKycDto {
  idNumber: string;
  fullName: string;
  dateOfBirth: string; // ISO date string
  nationality: string;
}

export interface ProviderProfileResponse {
  id: string;
  userId: string;
  status: string;
  providerType: ProviderType;
  bio: string | null;
  experienceYears: number | null;
  rating: number;
  totalReviews: number;
  baseLocationLat: number | null;
  baseLocationLng: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
