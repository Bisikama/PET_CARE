export interface BookingPet {
  id: string;
  pet_name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number;
  health_note?: string;
  behavior_note?: string;
  avatar_url?: string;
  booking_services: {
    service_name: string;
    price: number;
    duration_minutes: number;
    booking_checklist_items?: {
      id: string;
      title: string;
      status: 'PENDING' | 'DONE' | 'SKIPPED';
      note?: string | null;
      completed_at?: string | null;
      order?: number;
    }[];
  }[];
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  avatarUrl?: string;
}

export interface CustomerAddress {
  address_line: string;
  formatted_address: string;
  ward?: string;
  district?: string;
  city?: string;
}

export interface ProviderBookingDetail {
  id: string;
  status: string;
  requested_date: string;
  estimated_start_at: string;
  estimated_end_at: string;
  total_price: number;
  customer_note?: string;
  provider_note?: string;
  
  discount_amount: string;
  address_snapshot?: {
    city: string;
    ward: string;
    district: string;
    addressLine: string;
    phone: string;
    receiverName: string;
  } | null;
  customer_addresses: CustomerAddress;
  booking_pets: BookingPet[];
}
