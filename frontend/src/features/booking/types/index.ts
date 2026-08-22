export interface BookingStepState {
  currentStep: number;
  selectedPetId: string | null;
  selectedServiceId?: string | null;
  petWeightClass?: string;
  specialNeeds?: string[];
  notes?: string;
}
