export interface ServiceArea {
  id: string;
  providerId: string;
  city: string;
  district: string;
  ward?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAreaDto {
  city: string;
  district: string;
  ward?: string;
}

export interface UpdateAreaDto {
  city?: string;
  district?: string;
  ward?: string;
  isActive?: boolean;
}
