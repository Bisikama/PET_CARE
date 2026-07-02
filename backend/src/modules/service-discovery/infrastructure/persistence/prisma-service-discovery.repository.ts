import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import {
  IServiceDiscoveryRepository,
  DiscoveredPackage,
  MatchedProvider,
} from '../../application/ports/service-discovery.repository.port';

@Injectable()
export class PrismaServiceDiscoveryRepository implements IServiceDiscoveryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPetById(
    petId: string,
    customerId: string,
  ): Promise<{ species: string; weight: number } | null> {
    const pet = await this.prisma.pets.findFirst({
      where: { id: petId, customer_id: customerId },
      select: { species: true, weight: true },
    });
    if (!pet) return null;
    return {
      species: pet.species,
      weight: pet.weight ? Number(pet.weight) : 0,
    };
  }

  async findAddressById(
    addressId: string,
    customerId: string,
  ): Promise<{ city: string; district: string; ward: string } | null> {
    const address = await this.prisma.customer_addresses.findFirst({
      where: { id: addressId, customer_id: customerId, deleted_at: null },
      select: { city: true, district: true, ward: true },
    });
    if (!address) return null;
    return {
      city: address.city || '',
      district: address.district || '',
      ward: address.ward || '',
    };
  }

  async findAvailablePackages(species: string, weight: number): Promise<DiscoveredPackage[]> {
    const services = await this.prisma.services.findMany({
      where: { is_active: true, deleted_at: null },
      include: {
        pricing_rules: {
          where: { is_active: true, deleted_at: null },
        },
        service_checklist_templates: {
          where: { deleted_at: null },
          orderBy: { sort_order: 'asc' },
        },
        cancellation_policy: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return services.map((s) => {
      // Find matching pricing rule
      const rule = s.pricing_rules.find((r) => {
        const matchesSpecies = r.pet_species.toLowerCase() === species.toLowerCase();
        const minW = r.min_weight ? Number(r.min_weight) : 0;
        const maxW = r.max_weight ? Number(r.max_weight) : 999999;
        const matchesWeight = weight >= minW && weight <= maxW;
        return matchesSpecies && matchesWeight;
      });

      const price = rule ? Number(rule.price) : Number(s.base_price);
      const duration = rule ? rule.duration_minutes : s.duration_minutes;

      return {
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        durationMinutes: duration,
        price,
        checklist: s.service_checklist_templates.map((t) => t.title),
        cancellationPolicy: s.cancellation_policy
          ? {
              id: s.cancellation_policy.id,
              name: s.cancellation_policy.name,
              rulesJson: s.cancellation_policy.rules_json,
            }
          : null,
      };
    });
  }

  async findMatchedProviders(params: {
    serviceId: string;
    species: string;
    weight: number;
    city: string;
    district: string;
    ward: string;
    date?: string;
  }): Promise<MatchedProvider[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const tomorrowDate = new Date(tomorrowStr);

    const targetDateStr = params.date || tomorrowStr;
    const targetDate = new Date(targetDateStr);

    // Fetch all providers with status APPROVED
    const providers = await this.prisma.provider_profiles.findMany({
      where: {
        status: 'APPROVED',
        kyc_status: 'APPROVED',
      },
      include: {
        users: {
          select: {
            fullName: true,
            avatarUrl: true,
            status: true,
            isActive: true,
          },
        },
        provider_services: {
          where: {
            service_id: params.serviceId,
            status: 'APPROVED',
            is_active: true,
          },
        },
        provider_service_areas: {
          where: {
            is_active: true,
            deleted_at: null,
          },
        },
        provider_trust_badges: {
          include: {
            trust_badges: true,
          },
        },
        provider_working_days: {
          where: {
            work_date: {
              in: [targetDate, tomorrowDate],
            },
          },
          include: {
            provider_working_slots: {
              where: {
                status: 'AVAILABLE',
              },
            },
          },
        },
      },
    });

    const matched: MatchedProvider[] = [];

    for (const p of providers) {
      // 1. Kiểm tra tài khoản user liên kết hoạt động
      if (!p.users || p.users.status !== 'ACTIVE' || !p.users.isActive) {
        continue;
      }

      // 2. Khớp gói dịch vụ, loại thú cưng và cân nặng
      const matchedCap = p.provider_services.find((ps) => {
        const matchesSpecies = ps.pet_species.toLowerCase() === params.species.toLowerCase();
        const minW = ps.min_weight ? Number(ps.min_weight) : 0;
        const maxW = ps.max_weight ? Number(ps.max_weight) : 999999;
        const matchesWeight = params.weight >= minW && params.weight <= maxW;
        return matchesSpecies && matchesWeight;
      });

      if (!matchedCap) {
        continue;
      }

      // 3. Khớp khu vực hoạt động (City/District/Ward)
      const servesArea = p.provider_service_areas.some((sa) => {
        const matchesCity = sa.city.toLowerCase() === params.city.toLowerCase();
        const matchesDist = sa.district.toLowerCase() === params.district.toLowerCase();
        const matchesWard = sa.ward.toLowerCase() === params.ward.toLowerCase();
        return matchesCity && matchesDist && matchesWard;
      });

      if (!servesArea) {
        continue;
      }

      // 4. Kiểm tra xem ngày đó có slot trống không (luôn kiểm tra để đảm bảo có slot available)
      const selectedDayRecord = p.provider_working_days.find((wd) => {
        const wdStr = wd.work_date.toISOString().split('T')[0];
        return wdStr === targetDateStr;
      });
      const hasSlotOnSelectedDate =
        !!selectedDayRecord && selectedDayRecord.provider_working_slots.length > 0;

      if (!hasSlotOnSelectedDate) {
        continue;
      }

      // 5. Kiểm tra xem ngày mai có slot trống không (để làm nhãn giải thích)
      const tomorrowRecord = p.provider_working_days.find((wd) => {
        const wdStr = wd.work_date.toISOString().split('T')[0];
        return wdStr === tomorrowStr;
      });
      const hasSlotTomorrow = !!tomorrowRecord && tomorrowRecord.provider_working_slots.length > 0;

      // 6. Map to MatchedProvider structure
      matched.push({
        id: p.id,
        userId: p.user_id,
        fullName: p.users.fullName,
        avatarUrl: p.users.avatarUrl,
        bio: p.bio,
        experienceYears: p.experience_years || 0,
        ratingAvg: p.rating_avg ? Number(p.rating_avg) : 0,
        totalReviews: p.total_reviews || 0,
        totalCompletedBookings: p.total_completed_bookings || 0,
        price: Number(matchedCap.price),
        durationMinutes: matchedCap.price ? 120 : 60, // Fallback if needed, or matchedCap has duration
        kycStatus: p.kyc_status,
        trustBadges: p.provider_trust_badges
          .filter((b) => !b.revoked_at)
          .map((b) => ({
            code: b.trust_badges.code,
            name: b.trust_badges.name,
          })),
        hasSlotTomorrow,
        servesDistrict: servesArea,
      });
    }

    return matched;
  }
}
