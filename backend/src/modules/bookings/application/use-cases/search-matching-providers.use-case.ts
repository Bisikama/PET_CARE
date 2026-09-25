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

      // Extract matching slots for the target date
      const now = new Date();
      let todayStr = now.toISOString().split('T')[0];
      try {
        todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);
      } catch {}

      let searchDateStr = dto.date;
      try {
        searchDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(dto.date));
      } catch {}

      // Find working day matching searchDateStr, or fallback to the closest FUTURE working day
      const targetWorkingDay =
        provider.provider_working_days.find((pwd: any) => {
          let pwdDate = new Date(pwd.work_date).toISOString().split('T')[0];
          try {
            pwdDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(pwd.work_date));
          } catch {}
          return pwdDate === searchDateStr;
        }) ||
        provider.provider_working_days.find((pwd: any) => {
          let pwdDate = new Date(pwd.work_date).toISOString().split('T')[0];
          try {
            pwdDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(pwd.work_date));
          } catch {}
          return pwdDate >= todayStr;
        });

      let rawSlots = targetWorkingDay?.provider_working_slots || [];
      if (rawSlots.length === 0) {
        // Collect available slots from future working days of this provider
        const futureDays = provider.provider_working_days.filter((pwd: any) => {
          let pwdDate = new Date(pwd.work_date).toISOString().split('T')[0];
          try {
            pwdDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(pwd.work_date));
          } catch {}
          return pwdDate >= todayStr;
        });
        rawSlots = futureDays.flatMap((pwd: any) => pwd.provider_working_slots || []);
      }

      let slotDateStr = searchDateStr;
      if (targetWorkingDay?.work_date) {
        try {
          slotDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(targetWorkingDay.work_date));
        } catch {}
      }

      const slots = rawSlots
        .filter((pws: any) => {
          if (!pws.time_slots) return false;
          if (pws.status && pws.status !== 'AVAILABLE') return false;

          let thisSlotDate = slotDateStr;
          if (pws.provider_working_days?.work_date) {
            try {
              thisSlotDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(pws.provider_working_days.work_date));
            } catch {}
          }

          if (thisSlotDate < todayStr) return false;
          if (thisSlotDate === todayStr) {
            const slotStart = new Date(`${thisSlotDate}T${pws.time_slots.start_time}:00+07:00`);
            return slotStart > now;
          }
          return true;
        })
        .map((pws: any) => ({
          providerWorkingSlotId: pws.id,
          slotId: pws.time_slots.id,
          name: pws.time_slots.name,
          startTime: pws.time_slots.start_time,
          endTime: pws.time_slots.end_time,
        }));

      // Enrich recommendation reasons
      if (service.pet_species && service.min_weight !== undefined && service.max_weight !== undefined) {
        const speciesText = service.pet_species.toLowerCase() === 'cat' ? 'mèo' : 'chó';
        recommendationReasons.unshift(
          `Chuyên chăm sóc ${speciesText} (${service.min_weight}–${service.max_weight} kg)`,
        );
      }

      return {
        providerId: provider.id,
        userId: provider.user_id,
        fullName: provider.users.fullName,
        avatarUrl: provider.users.avatarUrl,
        ratingAvg: Number(provider.rating_avg),
        totalCompletedBookings: provider.total_completed_bookings,
        servicePrice: price,
        minWeight: Number(service.min_weight),
        maxWeight: Number(service.max_weight),
        petSpecies: service.pet_species,
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
