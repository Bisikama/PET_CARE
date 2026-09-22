export interface ProviderScheduleSlot {
  id: string;
  provider_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  is_blocked: boolean;
}

export interface ProviderReview {
  id: string;
  authorName: string;
  petOwnerInfo: string;
  authorAvatarUrl: string;
  rating: number;
  comment: string;
  timeAgo: string;
  isVerifiedWalk?: boolean;
}

export interface ProviderWeightTierPrice {
  id: string;
  title: string;
  subtext: string;
  price: number;
  isPopular?: boolean;
  isCat?: boolean;
}

export interface ProviderDetailProfile {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
  coverUrl: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  location: string;
  yearsExperience: number;
  completedJobs: number;
  repeatRate: number; // e.g. 100
  avgReplyMinutes: number; // e.g. 12
  aboutBio: string;
  specializationTags: string[];
  mainPackageName: string;
  mainPackageDescription: string;
  mainPackagePrice: number;
  mainPackageFeatures: string[];
  pricingTiers: ProviderWeightTierPrice[];
  galleryPhotos: string[];
  totalPhotosCount: number;
  reviewAttributeTags: { label: string; count: number }[];
  featuredReview: ProviderReview;
  nextAvailableToday: string;
  weeklySchedule: { day: string; hours: string; isOff?: boolean }[];
}
