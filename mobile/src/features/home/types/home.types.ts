export interface ServiceCategory {
  id: string;
  name: string;
  iconName: string;
  hasAccent?: boolean;
}

export interface UpcomingAppointment {
  id: string;
  providerName: string;
  providerImage: string;
  isVerified: boolean;
  serviceTitle: string;
  petName: string;
  petBreed?: string;
  date: string;
  time: string;
  locationType: string;
  status: 'confirmed' | 'in_progress' | 'pending';
}

export interface HomeProvider {
  id: string;
  name: string;
  image: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  startingPrice: number;
  tags: string[];
  isFavorite: boolean;
}

export interface SpecialPromo {
  id: string;
  tag: string;
  title: string;
  code: string;
  imageUrl: string;
}
