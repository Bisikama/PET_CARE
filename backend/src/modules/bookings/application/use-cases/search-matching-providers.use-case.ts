/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import { SearchProviderDto } from '../../presentation/dto/search-provider.dto';

@Injectable()
export class SearchMatchingProvidersUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
  ) {}

  async execute(dto: SearchProviderDto) {
    // 1. Verify Pet exists and get details
    const pet = await this.bookingRepo.findPetById(dto.petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${dto.petId} not found`);
    }

    // 2. Verify Address exists and get details
    const address = await this.bookingRepo.findAddressById(dto.addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${dto.addressId} not found`);
    }

    // 3. Match providers based on criteria
    const providers = await this.bookingRepo.searchMatchingProviders(
      dto.serviceId,
      pet.species,
      Number(pet.weight),
      address.city,
      address.district,
      address.ward,
      new Date(dto.date),
    );

    // 4. Score and Rank Providers (Flow 25)
    const rankedProviders = providers.map((provider) => {
      const recommendationReasons: string[] = [];

      // Generate recommendation explanations
      if (Number(provider.rating_avg) >= 4.8) {
        recommendationReasons.push(`Được đánh giá cao (${provider.rating_avg}⭐)`);
      }
      if (provider.total_completed_bookings > 10) {
        recommendationReasons.push(
          `Hoàn thành nhiều đơn hàng (${provider.total_completed_bookings})`,
        );
      }
      if (provider.experience_years > 3) {
        recommendationReasons.push(`${provider.experience_years} năm kinh nghiệm`);
      }
      if (recommendationReasons.length === 0) {
        recommendationReasons.push('Đối tác uy tín trong khu vực');
      }

      // Calculate simple matching score
      let score = Number(provider.rating_avg) * 10;
      score += provider.experience_years * 2;
      score += provider.total_completed_bookings * 0.5;

      // Extract matching service details
      const service = provider.provider_services[0];
      const price = Number(service.price);

      // Extract matching slots
      const slots =
        provider.provider_working_days[0]?.provider_working_slots.map((pws: any) => ({
          providerWorkingSlotId: pws.id,
          slotId: pws.time_slots.id,
          name: pws.time_slots.name,
          startTime: pws.time_slots.start_time,
          endTime: pws.time_slots.end_time,
        })) || [];

      return {
        providerId: provider.id,
        userId: provider.user_id,
        fullName: provider.users.fullName,
        avatarUrl: provider.users.avatarUrl,
        ratingAvg: Number(provider.rating_avg),
        totalCompletedBookings: provider.total_completed_bookings,
        servicePrice: price,
        slots: slots,
        recommendationReasons,
        score,
      };
    });

    // Sort by matching score descending
    rankedProviders.sort((a, b) => b.score - a.score);

    return rankedProviders;
  }
}
