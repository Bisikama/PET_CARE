export interface BookingStepState {
  currentStep: number;
  selectedPetId: string | null;
  selectedServiceId?: string | null;
  selectedAddressId?: string | null;
  selectedProviderId?: string | null;
  selectedSlotId?: string | null;
  createdBookingId?: string | null;
  petWeightClass?: string;
  specialNeeds?: string[];
  notes?: string;
}

export interface ScheduleSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'PENDING' | 'BOOKED' | 'UNAVAILABLE';
}

export interface ProviderScheduleResponse {
  date: string;
  slots: ScheduleSlot[];
}

// ─── Booking Domain Types ───────────────────────────────────────────────────

export type BookingStatus =
  | 'PENDING_PAYMENT'
  | 'PENDING_PROVIDER_ACCEPTANCE'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'DISPUTED';

export type CancelReason =
  | 'CUSTOMER_REQUEST'
  | 'PROVIDER_UNAVAILABLE'
  | 'SCHEDULE_CONFLICT'
  | 'OTHER';

export interface BookingPet {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
}

export interface BookingProvider {
  id: string;
  full_name: string;
  avatar_url?: string | null;
}

export interface BookingService {
  id: string;
  name: string;
}

export interface BookingPayment {
  id: string;
  amount: number;
  method: string;
  status: string;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  requested_date: string;
  estimated_start_at?: string | null;
  estimated_end_at?: string | null;
  total_price: number;
  notes?: string | null;
  cancel_reason?: CancelReason | null;
  cancel_note?: string | null;
  cancelled_at?: string | null;
  created_at: string;
  updated_at: string;
  pet?: BookingPet | null;
  provider?: BookingProvider | null;
  service?: BookingService | null;
  payments?: BookingPayment | null;
}

export interface CancelBookingPayload {
  reason: CancelReason;
  note?: string;
}
