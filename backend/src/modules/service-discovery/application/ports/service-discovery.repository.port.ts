export interface DiscoveredPackage {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  durationMinutes: number;
  price: number; // Calculated price (pricing rule or base price)
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
  price: number; // provider custom service price
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
