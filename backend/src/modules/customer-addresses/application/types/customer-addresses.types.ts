export interface CustomerAddressRecord {
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
  addressType: 'HOME' | 'WORK' | 'OTHER' | null;
  isDefault: boolean;
  createdAt: Date;
  deletedAt: Date | null;
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
  addressType?: 'HOME' | 'WORK' | 'OTHER';
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
  addressType?: 'HOME' | 'WORK' | 'OTHER';
  isDefault?: boolean;
}
