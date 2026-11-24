export interface DiscoveredPackage {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  durationMinutes: number;
  price: number; // Giá niêm yết theo bảng giá (hoặc giá gốc nếu gói chưa có bảng giá)
  /** Thú cưng nằm ngoài các mức cân nặng có giá niêm yết => cần báo giá riêng */
  requiresQuote?: boolean;
  checklist: string[]; // checklist titles
  cancellationPolicy: any; // policy details
}

export interface MatchedProvider {
  id: string; // provider_profile id
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  experienceYears: number;
  ratingAvg: number;
  totalReviews: number;
  totalCompletedBookings: number;
  price: number; // Giá niêm yết của hệ thống (gói chưa có bảng giá => giá đối tác)
  durationMinutes: number;
  kycStatus: string;
  trustBadges: { code: string; name: string }[];
  hasSlotTomorrow: boolean;
  servesDistrict: boolean;
}

export interface IServiceDiscoveryRepository {
  findAvailablePackages(species: string, weight: number): Promise<DiscoveredPackage[]>;
  findMatchedProviders(params: {
    serviceId: string;
    species: string;
    weight: number;
    city: string;
    district: string;
    ward: string;
    date?: string; // YYYY-MM-DD
  }): Promise<MatchedProvider[]>;
  findPetById(
    petId: string,
    customerId: string,
  ): Promise<{ species: string; weight: number } | null>;
  findAddressById(
    addressId: string,
    customerId: string,
  ): Promise<{ city: string; district: string; ward: string } | null>;
}
