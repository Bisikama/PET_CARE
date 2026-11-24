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
  baseAddressLine?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  baseWard?: string;
  baseDistrict?: string;
  baseCity?: string;
  baseLatitude?: number;
  baseLongitude?: number;
  baseFormatted?: string;
  serviceRadiusKm?: number;
}

export interface AddServiceAreaDto {
  name: string;
  radiusKm: number;
  latitude: number;
  longitude: number;
}

/** Khớp RegisterCapabilityDto của backend. Giá do PetCare niêm yết nên đối tác không gửi giá. */
export interface RegisterCapabilityDto {
  serviceId: string;
  petSpecies: 'Dog' | 'Cat';
  minWeight: number;
  maxWeight: number;
}

export interface SubmitKycDto {
  idNumber: string;
  fullName: string;
  dob?: string;
  dateOfBirth?: string;
  issueDate?: string;
  nationality?: string;
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
