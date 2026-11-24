export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Thú cưng ngoài các mức cân nặng có giá niêm yết => liên hệ báo giá riêng */
  requiresQuote?: boolean;
  discountPercentage?: number;
  servicesIncluded: string[];
  createdAt: string;
}

export interface ServiceRecommendation {
  id: string;
  serviceId: string;
  serviceName: string;
  reason: string;
  score: number;
  providerId?: string;
  providerName?: string;
}

export interface ServiceSuggestionDto {
  title: string;
  description: string;
  category?: string;
  expectedPrice?: number;
}
