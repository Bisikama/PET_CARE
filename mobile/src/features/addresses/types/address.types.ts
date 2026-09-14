export interface Address {
  id: string;
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
  addressType?: string;
  isDefault?: boolean;
}

export type CreateAddressRequest = Omit<Address, 'id'>;
export type UpdateAddressRequest = Partial<CreateAddressRequest>;

export interface CalculateDistanceRequest {
  originPlaceId?: string;
  originLat?: number;
  originLng?: number;
  destinationPlaceId?: string;
  destinationLat?: number;
  destinationLng?: number;
}

export interface DistanceResult {
  distanceMeters: number;
  durationSeconds: number;
}
