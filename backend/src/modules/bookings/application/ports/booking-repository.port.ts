import { booking_status, availability_slot_status, booking_event_type } from '@prisma/client';

export interface BookingRepositoryPort {
  findPetById(petId: string): Promise<any>;
  findAddressById(addressId: string): Promise<any>;
  findProviderWorkingSlotById(slotId: string, tx?: any): Promise<any>;
  updateWorkingSlotStatus(
    slotId: string,
    status: availability_slot_status,
    reservedUntil?: Date | null,
    tx?: any,
  ): Promise<number>; // returns updated row count (for concurrency check)
  findProviderService(
    providerId: string,
    serviceId: string,
    petSpecies: string,
    petWeight: number,
  ): Promise<any>;
  createBooking(
    bookingData: {
      customerId: string;
      providerId: string;
      addressId: string;
      providerWorkingSlotId: string;
      requestedSlotId: string;
      requestedDate: Date;
      serviceDurationMinutes: number;
      estimatedStartAt: Date;
      estimatedEndAt: Date;
      status: booking_status;
      totalPrice: number;
      customerNote?: string;
      addressSnapshot?: any;
      priceSnapshot?: any;
    },
    bookingPetData: {
      petId: string;
      petName: string;
      species: string;
      breed?: string;
      age?: number;
      weight?: number;
      gender?: string;
      healthNote?: string;
      behaviorNote?: string;
      avatarUrl?: string;
    },
    bookingServiceData: {
      providerServiceId: string;
      price: number;
      durationMinutes: number;
      serviceName: string;
      serviceDescription?: string;
      serviceCategory?: string;
    },
    tx?: any,
  ): Promise<any>;
  findBookingById(bookingId: string, tx?: any): Promise<any>;
  updateBookingStatus(bookingId: string, status: booking_status, tx?: any): Promise<any>;
  addBookingEvent(
    bookingId: string,
    actorId: string | null,
    eventType: booking_event_type,
    note?: string,
    tx?: any,
  ): Promise<any>;
  searchMatchingProviders(
    serviceId: string,
    petSpecies: string,
    petWeight: number,
    city: string,
    district: string,
    ward: string,
    date: Date,
  ): Promise<any[]>;
}
