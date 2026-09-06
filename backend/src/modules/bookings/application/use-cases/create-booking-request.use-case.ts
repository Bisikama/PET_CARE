import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { BOOKING_REPOSITORY, UNIT_OF_WORK } from '../../booking.tokens';
import type { BookingRepositoryPort } from '../ports/booking-repository.port';
import type { UnitOfWorkPort } from '../ports/unit-of-work.port';
import { CreateBookingDto } from '../../presentation/dto/create-booking.dto';
import { PrismaService } from '../../../../database/prisma.service';
import { GeoLocationHelper } from '../../../../common/utils/geo-location.helper';
import { PaymentsService } from '../../../payments/application/use-cases/payments.service';

@Injectable()
export class CreateBookingRequestUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: BookingRepositoryPort,
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWorkPort,
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async execute(customerId: string, dto: CreateBookingDto, ipAddress: string = '127.0.0.1') {
    // 1. Verify Pet and ownership
    const pet = await this.bookingRepo.findPetById(dto.petId);
    if (!pet) {
      throw new NotFoundException(`Pet with ID ${dto.petId} not found`);
    }
    if (pet.customer_id !== customerId) {
      throw new BadRequestException('Thú cưng này không thuộc về tài khoản của bạn.');
    }

    // 2. Verify Address and ownership
    const address = await this.bookingRepo.findAddressById(dto.addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${dto.addressId} not found`);
    }
    if (address.customer_id !== customerId) {
      throw new BadRequestException('Địa chỉ này không thuộc về tài khoản của bạn.');
    }

    // 3. Verify Working Slot
    const slot = await this.bookingRepo.findProviderWorkingSlotById(dto.providerWorkingSlotId);
    if (!slot) {
      throw new NotFoundException(`Working slot with ID ${dto.providerWorkingSlotId} not found`);
    }
    const providerId = slot.provider_working_days.provider_id;
    const workDate = slot.provider_working_days.work_date;

    // 4. Verify Provider Capability and Service
    const providerService = await this.bookingRepo.findProviderService(
      providerId,
      dto.serviceId,
      pet.species,
      Number(pet.weight),
    );
    if (!providerService) {
      throw new BadRequestException(
        'Đối tác không cung cấp dịch vụ này hoặc không hỗ trợ loài/cân nặng của thú cưng.',
      );
    }

    // 5. Calculate Distance & Travel Fee using GeoLocationHelper
    const providerProfile = await this.prisma.provider_profiles.findUnique({
      where: { id: providerId },
    });
    if (!providerProfile) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tác');
    }

    let travelFee = 0;
    let travelDurationMinutes = 0;
    let distanceKm = 0;

    if (providerProfile.base_latitude && providerProfile.base_longitude) {
      const serviceRadiusKm = providerProfile.service_radius_km
        ? Number(providerProfile.service_radius_km)
        : 5;
      const distanceResult = GeoLocationHelper.calculateRoadDistance(
        { latitude: Number(address.latitude), longitude: Number(address.longitude) },
        {
          latitude: Number(providerProfile.base_latitude),
          longitude: Number(providerProfile.base_longitude),
        },
        serviceRadiusKm,
      );
      travelFee = distanceResult.travelSurcharge;
      travelDurationMinutes = distanceResult.estimatedDurationMinutes;
      distanceKm = distanceResult.estimatedRoadDistanceKm;
    }

    const servicePrice = Number(providerService.price);
    const subtotal = servicePrice;

    // 6. Validate & Calculate Promotion Discount if promoCode is provided
    let discountAmount = 0;
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

      if (promo.discount_percent) {
        discountAmount = (subtotal * promo.discount_percent) / 100;
        if (promo.max_discount_amount) {
          discountAmount = Math.min(discountAmount, Number(promo.max_discount_amount));
        }
      } else if (promo.discount_amount) {
        discountAmount = Number(promo.discount_amount);
      }

      discountAmount = Math.min(discountAmount, subtotal + travelFee);
      appliedPromoCode = normalizedCode;
      promotionId = promo.id;
    }

    const totalPrice = Math.max(0, subtotal + travelFee - discountAmount);

    // Calculate dates & times
    const dateStr = workDate.toISOString().split('T')[0];
    const estimatedStartAt = new Date(`${dateStr}T${slot.time_slots.start_time}:00`);
    const estimatedEndAt = new Date(`${dateStr}T${slot.time_slots.end_time}:00`);

    // 7. Execute transaction with concurrency check
    const booking = await this.unitOfWork.transaction(async (tx) => {
      // Concurrency update: check if slot is AVAILABLE and update status to RESERVED
      const reservedUntil = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes reservation
      const affectedRows = await this.bookingRepo.updateWorkingSlotStatus(
        dto.providerWorkingSlotId,
        'RESERVED_FOR_PROVIDER_RESPONSE',
        reservedUntil,
        tx,
      );

      if (affectedRows === 0) {
        throw new ConflictException(
          'Slot này vừa được người khác đặt trước. Vui lòng chọn ca làm việc khác.',
        );
      }

      // Build snapshots
      const addressSnapshot = {
        receiverName: address.receiver_name,
        phone: address.phone,
        addressLine: address.address_line,
        ward: address.ward,
        district: address.district,
        city: address.city,
      };

      const priceSnapshot = {
        basePrice: Number(providerService.services.basePrice || providerService.price),
        servicePrice,
        travelFee,
        distanceKm,
        discountAmount,
        promoCode: appliedPromoCode,
        finalPrice: totalPrice,
      };

      // Create booking and related tables
      const newBooking = await this.bookingRepo.createBooking(
        {
          customerId,
          providerId,
          addressId: dto.addressId,
          providerWorkingSlotId: dto.providerWorkingSlotId,
          requestedSlotId: slot.slot_id,
          requestedDate: workDate,
          serviceDurationMinutes: providerService.services.duration_minutes,
          travelDurationMinutes,
          estimatedStartAt,
          estimatedEndAt,
          status: 'PENDING_PAYMENT',
          totalPrice,
          discountAmount,
          promotionId,
          customerNote: dto.customerNote,
          addressSnapshot,
          priceSnapshot,
        },
        {
          petId: pet.id,
          petName: pet.name,
          species: pet.species,
          breed: pet.breed || undefined,
          age: pet.age || undefined,
          weight: Number(pet.weight) || undefined,
          gender: pet.gender || undefined,
          healthNote: pet.health_note || undefined,
          behaviorNote: pet.behavior_note || undefined,
          avatarUrl: pet.avatar_url || undefined,
        },
        {
          providerServiceId: providerService.id,
          serviceId: dto.serviceId,
          price: Number(providerService.price),
          durationMinutes: providerService.services.duration_minutes,
          serviceName: providerService.services.name,
          serviceDescription: providerService.services.description || undefined,
          serviceCategory: providerService.services.category || undefined,
        },
        tx,
      );

      // Record promotion usage if voucher applied
      if (promotionId) {
        await tx.promotion_usages.create({
          data: {
            promotion_id: promotionId,
            user_id: customerId,
            booking_id: newBooking.id,
          },
        });
        await tx.promotions.update({
          where: { id: promotionId },
          data: { used_count: { increment: 1 } },
        });
      }

      // Log event
      await this.bookingRepo.addBookingEvent(
        newBooking.id,
        customerId,
        'BOOKING_CREATED',
        'Booking request submitted by customer and awaiting payment',
        tx,
      );

      return newBooking;
    });

    // 8. Generate VNPay URL outside the transaction to avoid holding DB lock during external logic
    const paymentUrl = await this.paymentsService.createVNPayUrl(
      booking.id,
      Number(booking.total_price),
      ipAddress,
    );

    return {
      booking,
      paymentUrl,
    };
  }
}

