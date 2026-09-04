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
