import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { SERVICE_DISCOVERY_REPOSITORY } from '../../service-discovery.tokens';
import type {
  IServiceDiscoveryRepository,
  MatchedProvider,
} from '../ports/service-discovery.repository.port';

export interface DiscoverProvidersInput {
  serviceId: string;
  customerId: string;
  petId?: string;
  species?: string;
  weight?: number;
  addressId?: string;
  city?: string;
  district?: string;
  ward?: string;
  date?: string; // YYYY-MM-DD
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  hasTrustBadge?: boolean;
}

export interface DiscoveredProviderOutput extends MatchedProvider {
  score: number;
  recommendationReasons: string[];
}

@Injectable()
export class DiscoverProvidersUseCase {
  constructor(
    @Inject(SERVICE_DISCOVERY_REPOSITORY)
    private readonly discoveryRepository: IServiceDiscoveryRepository,
  ) {}

  async execute(input: DiscoverProvidersInput): Promise<DiscoveredProviderOutput[]> {
    // 1. Resolve Pet Details (Species & Weight)
    let species = input.species;
    let weight = input.weight;

    if (input.petId) {
      const pet = await this.discoveryRepository.findPetById(input.petId, input.customerId);
      if (!pet) {
        throw new NotFoundException('Không tìm thấy thú cưng yêu cầu hoặc không thuộc về bạn.');
      }
      species = pet.species;
      weight = pet.weight;
    }

    if (!species || weight === undefined) {
      throw new BadRequestException(
        'Vui lòng cung cấp petId hoặc thông tin species và weight của thú cưng.',
      );
    }

    if (species.toLowerCase() !== 'dog' && species.toLowerCase() !== 'cat') {
      throw new BadRequestException('Loại thú cưng phải là Dog hoặc Cat.');
    }

    // 2. Resolve Address Details (City/District/Ward)
    let city = input.city;
    let district = input.district;
    let ward = input.ward;

    if (input.addressId) {
      const address = await this.discoveryRepository.findAddressById(
        input.addressId,
        input.customerId,
      );
      if (!address) {
        throw new NotFoundException('Không tìm thấy địa chỉ yêu cầu hoặc không thuộc về bạn.');
      }
      city = address.city;
      district = address.district;
      ward = address.ward;
    }

    if (!city || !district || !ward) {
      throw new BadRequestException(
        'Vui lòng cung cấp addressId hoặc địa chỉ chi tiết (city, district, ward).',
      );
    }

    // 3. Find Matched Providers from DB
    const providers = await this.discoveryRepository.findMatchedProviders({
      serviceId: input.serviceId,
      species,
      weight,
      city,
      district,
      ward,
      date: input.date,
    });

    // 4. Apply filters (price, rating, trust badge) in memory
    let filtered = providers;

    if (input.priceMin !== undefined) {
      filtered = filtered.filter((p) => p.price >= input.priceMin!);
    }
    if (input.priceMax !== undefined) {
      filtered = filtered.filter((p) => p.price <= input.priceMax!);
    }
    if (input.ratingMin !== undefined) {
      filtered = filtered.filter((p) => p.ratingAvg >= input.ratingMin!);
    }
    if (input.hasTrustBadge) {
      filtered = filtered.filter((p) => p.trustBadges.length > 0);
    }

    // 5. Calculate Score and Generate Recommendation Reasons
    const outputs: DiscoveredProviderOutput[] = filtered.map((p) => {
      // Calculate scores
      const ratingScore = p.ratingAvg * 20; // 0 to 100
      const bookingScore = Math.min(p.totalCompletedBookings * 2, 20); // max 20
      const badgeScore = Math.min(p.trustBadges.length * 10, 20); // max 20

      // Price score: lower price gets a small score bonus
      const priceScore = Math.max(0, 10 - p.price / 100000); // max 10

      const totalScore = Math.round(ratingScore + bookingScore + badgeScore + priceScore);

      // Generate recommendation reasons
      const reasons: string[] = [];

      // Species and weight confirmation
      const weightRangeStr = `${weight}kg`;
      reasons.push(`Phù hợp ${species.toLowerCase() === 'dog' ? 'chó' : 'mèo'} ${weightRangeStr}`);

      // Identity verification
      if (p.kycStatus === 'APPROVED') {
        reasons.push('Đã xác minh danh tính');
      }

      // Slot availability tomorrow
      if (p.hasSlotTomorrow) {
        reasons.push('Có slot ngày mai');
      }

      // Rating value
      if (p.ratingAvg >= 4.8) {
        reasons.push(`Rating cao ${p.ratingAvg}`);
      }

      // Location match
      reasons.push(`Phục vụ tại ${district}`);

      return {
        ...p,
        score: totalScore,
        recommendationReasons: reasons,
      };
    });

    // 6. Sort by Score descending
    return outputs.sort((a, b) => b.score - a.score);
  }
}
