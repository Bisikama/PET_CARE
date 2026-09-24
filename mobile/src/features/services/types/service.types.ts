export interface PetSizeOption {
  id: string;
  label: string;
  weightRange: string;
  price: number;
}

export interface ServiceAddon {
  id: string;
  label: string;
  description: string;
  price: number;
}

export interface ServiceIncludedItem {
  id: string;
  title: string;
  iconName: string;
}

export interface ServiceDetail {
  id: string;
  title: string;
  categoryTag: string;
  completedCount: number;
  providerId: string;
  providerName: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  durationText: string;
  imageUrl: string;
  overviewDescription: string;
  includedItems: ServiceIncludedItem[];
  petSizes: PetSizeOption[];
  addons: ServiceAddon[];
  suitablePets: string;
  healthRequirements: string;
  cancellationPolicy: string;
}
