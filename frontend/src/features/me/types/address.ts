export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string | null;
  receiverName: string | null;
  phone: string | null;
  addressLine: string;
  ward: string | null;
  district: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  formattedAddress: string | null;
  placeId: string | null;
  addressType: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault: boolean;
  createdAt: string;
  deletedAt: string | null;
}

export interface CreateAddressInput {
  label?: string;
  receiverName?: string;
  phone?: string;
  addressLine: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  placeId?: string;
  addressType?: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault?: boolean;
}

export interface UpdateAddressInput {
  label?: string;
  receiverName?: string;
  phone?: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  placeId?: string;
  addressType?: 'HOME' | 'OFFICE' | 'OTHER';
  isDefault?: boolean;
}
