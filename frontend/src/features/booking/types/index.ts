export interface BookingStepState {
  currentStep: number;
  selectedPetId: string | null;
  selectedServiceId?: string | null;
  selectedAddressId?: string | null;
  selectedProviderId?: string | null;
  petWeightClass?: string;
  specialNeeds?: string[];
  notes?: string;
}
