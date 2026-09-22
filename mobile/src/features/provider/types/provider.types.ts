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
  baseAddressLine: string;
  baseWard?: string;
  baseDistrict?: string;
  baseCity?: string;
  baseLatitude: number;
  baseLongitude: number;
  baseFormatted?: string;
  serviceRadiusKm?: number;
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
  dob: string;
  issueDate: string;
}

export interface SubmitDocumentsDto {
  certificateImages: { uri: string; type: string; name: string }[];
}

export interface ProviderProfileResponse {
  id: string;
  userId: string;
  status: string;
  kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
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
