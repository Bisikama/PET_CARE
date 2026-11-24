import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { GeoLocationHelper } from '../../../../common/utils/geo-location.helper';
import { CalculateBookingPriceDto } from '../../presentation/dto/calculate-booking-price.dto';
import { resolveBookableServicePrice } from '../../../services/domain/service-pricing';
import { loadTravelPolicy } from '../../../services/domain/service-fees';

export interface BookingPriceCalculationResult {
  item: {
    petId: string;
    petName: string;
    species: string;
    breed?: string | null;
    weight?: number | null;
    serviceId: string;
    serviceName: string;
    serviceDurationMinutes: number;
    servicePrice: number;
  };
  subtotal: number;
  distance: {
    straightLineDistanceKm: number;
    estimatedRoadDistanceKm: number;
    travelDurationMinutes: number;
    travelFee: number;
    isWithinServiceRadius: boolean;
    serviceRadiusKm: number;
  };
  discount: {
    promoCode?: string;
    discountAmount: number;
    promotionId?: string;
    memberDiscount?: {
      tierName: string;
      tierLabel: string;
      discountPercent: number;
      discountAmount: number;
    };
    voucherDiscountAmount?: number;
  };
  totalPrice: number;
  totalEstimatedDurationMinutes: number;
}

@Injectable()
export class CalculateBookingPriceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    customerId: string,
    dto: CalculateBookingPriceDto,
  ): Promise<BookingPriceCalculationResult> {
    // 1. Xác thực thông tin thú cưng và quyền sở hữu
    const pet = await this.prisma.pets.findUnique({
      where: { id: dto.petId },
    });
    if (!pet) {
      throw new NotFoundException(`Không tìm thấy thú cưng với ID ${dto.petId}`);
    }
    if (pet.customer_id !== customerId) {
      throw new BadRequestException('Thú cưng này không thuộc quyền sở hữu của bạn.');
    }

    // 2. Xác thực địa chỉ phục vụ của khách hàng
    const address = await this.prisma.customer_addresses.findUnique({
      where: { id: dto.addressId },
    });
    if (!address) {
      throw new NotFoundException(`Không tìm thấy địa chỉ với ID ${dto.addressId}`);
    }
    if (address.customer_id !== customerId) {
      throw new BadRequestException('Địa chỉ này không thuộc về tài khoản của bạn.');
    }

    // 3. Xác thực thông tin đối tác (Provider) và tọa độ cơ sở
    const provider = await this.prisma.provider_profiles.findUnique({
      where: { id: dto.providerId },
      include: {
        users: { select: { fullName: true } },
      },
    });
    if (!provider) {
      throw new NotFoundException(`Không tìm thấy hồ sơ đối tác với ID ${dto.providerId}`);
    }
    if (provider.status !== 'APPROVED' && provider.status !== 'PAUSED') {
      throw new BadRequestException('Đối tác hiện chưa sẵn sàng nhận đơn phục vụ.');
    }
    if (!provider.base_latitude || !provider.base_longitude) {
      throw new BadRequestException('Đối tác chưa thiết lập tọa độ cơ sở hoạt động.');
    }

    // 4. Kiểm tra năng lực và lấy giá dịch vụ của Provider
    const petWeight = Number(pet.weight) || 0;
    const providerService = await this.prisma.provider_services.findFirst({
      where: {
        provider_id: dto.providerId,
        service_id: dto.serviceId,
        pet_species: pet.species,
        min_weight: { lte: petWeight },
        max_weight: { gte: petWeight },
        status: 'APPROVED',
        is_active: true,
      },
      include: {
        services: true,
      },
    });

    if (!providerService) {
      throw new BadRequestException(
        `Đối tác không cung cấp dịch vụ này cho loài ${pet.species} (${petWeight}kg).`,
      );
    }

    // Giá niêm yết của hệ thống theo cân nặng (gói chưa có bảng giá => giá đối tác)
    const { price: servicePrice, durationMinutes: serviceDuration } = await resolveBookableServicePrice(
      this.prisma,
      {
        serviceId: providerService.service_id,
        species: pet.species,
        weight: petWeight,
        fallback: {
          price: Number(providerService.price),
          durationMinutes: providerService.services.duration_minutes || 60,
        },
      },
    );
    const subtotal = servicePrice;

    // 5. Tính toán khoảng cách và phụ phí di chuyển qua GeoLocationHelper
    const serviceRadiusKm = provider.service_radius_km ? Number(provider.service_radius_km) : 5;
    const distanceResult = GeoLocationHelper.calculateRoadDistance(
      { latitude: Number(address.latitude), longitude: Number(address.longitude) },
      { latitude: Number(provider.base_latitude), longitude: Number(provider.base_longitude) },
      serviceRadiusKm,
      await loadTravelPolicy(this.prisma),
    );

    const travelFee = distanceResult.travelSurcharge;
    const travelDurationMinutes = distanceResult.estimatedDurationMinutes;
    const isWithinRadius = distanceResult.isWithinServiceRadius ?? true;

    // 6. Kiểm tra quyền lợi Hội viên (Membership Discount) & Mã giảm giá (Voucher)
    let memberDiscountAmount = 0;
    let memberDiscountInfo: BookingPriceCalculationResult['discount']['memberDiscount'] | undefined;

    const activeSubscription = await this.prisma.subscriptions?.findFirst?.({
      where: {
        user_id: customerId,
        status: 'ACTIVE',
        end_date: { gt: new Date() },
      },
      include: {
        plan: true,
      },
      orderBy: { end_date: 'desc' },
    });

    if (activeSubscription) {
      const tierName = activeSubscription.tier_name.toUpperCase();
      const discountPercent = (tierName === 'PREMIUM' || tierName === 'YEARLY') ? 15 : 5;
      memberDiscountAmount = Math.round((subtotal * discountPercent) / 100);

      const tierLabel =
        activeSubscription.plan?.name ||
        (tierName === 'PREMIUM' ? 'Gói VIP Pro' : tierName === 'YEARLY' ? 'Gói Tiết Kiệm Năm' : 'Gói Cơ Bản');

      memberDiscountInfo = {
        tierName,
        tierLabel,
        discountPercent,
        discountAmount: memberDiscountAmount,
      };
    }

    let voucherDiscountAmount = 0;
    let appliedPromoCode: string | undefined;
    let promotionId: string | undefined;

    if (dto.promoCode && dto.promoCode.trim() !== '') {
      const normalizedCode = dto.promoCode.toUpperCase().trim();
      const promo = await this.prisma.promotions.findUnique({
        where: { code: normalizedCode },
      });

      const now = new Date();
      if (!promo || !promo.is_active) {
        throw new BadRequestException('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.');
      }
      if (now < promo.start_date || now > promo.end_date) {
        throw new BadRequestException('Mã giảm giá đã hết hạn hoặc chưa đến thời gian áp dụng.');
      }
      const minOrderValue = promo.min_order_value ? Number(promo.min_order_value) : 0;
      if (subtotal < minOrderValue) {
        throw new BadRequestException(
          `Đơn hàng chưa đạt giá trị tối thiểu ${minOrderValue.toLocaleString('vi-VN')}đ để áp dụng mã này.`,
        );
      }
      if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
        throw new BadRequestException('Mã giảm giá đã hết lượt sử dụng.');
      }
      if (promo.max_usage_per_user) {
        const userUsageCount = await this.prisma.promotion_usages.count({
          where: { promotion_id: promo.id, user_id: customerId },
        });
        if (userUsageCount >= promo.max_usage_per_user) {
          throw new BadRequestException('Bạn đã hết lượt sử dụng mã khuyến mãi này.');
        }
      }

      // Tính số tiền giảm giá của voucher
      if (promo.discount_percent) {
        voucherDiscountAmount = (subtotal * promo.discount_percent) / 100;
        if (promo.max_discount_amount) {
          voucherDiscountAmount = Math.min(voucherDiscountAmount, Number(promo.max_discount_amount));
        }
      } else if (promo.discount_amount) {
        voucherDiscountAmount = Number(promo.discount_amount);
      }

      appliedPromoCode = normalizedCode;
      promotionId = promo.id;
    }

    const discountAmount = Math.min(memberDiscountAmount + voucherDiscountAmount, subtotal + travelFee);

    // 7. Tổng tiền thanh toán cuối cùng
    const totalPrice = Math.max(0, subtotal + travelFee - discountAmount);
    const totalEstimatedDurationMinutes = serviceDuration + travelDurationMinutes;

    return {
      item: {
        petId: pet.id,
        petName: pet.name,
        species: pet.species,
        breed: pet.breed,
        weight: petWeight,
        serviceId: providerService.service_id,
        serviceName: providerService.services.name,
        serviceDurationMinutes: serviceDuration,
        servicePrice,
      },
      subtotal,
      distance: {
        straightLineDistanceKm: distanceResult.straightLineDistanceKm,
        estimatedRoadDistanceKm: distanceResult.estimatedRoadDistanceKm,
        travelDurationMinutes,
        travelFee,
        isWithinServiceRadius: isWithinRadius,
        serviceRadiusKm,
      },
      discount: {
        promoCode: appliedPromoCode,
        discountAmount,
        promotionId,
        memberDiscount: memberDiscountInfo,
        voucherDiscountAmount,
      },
      totalPrice,
      totalEstimatedDurationMinutes,
    };
  }
}
