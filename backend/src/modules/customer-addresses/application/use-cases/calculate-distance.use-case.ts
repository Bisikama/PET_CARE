import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { GeoLocationHelper, DistanceCalculationResult } from '../../../../common/utils/geo-location.helper';
import { CalculateDistanceDto } from '../../dto/calculate-distance.dto';

export interface DetailedDistanceResponse extends DistanceCalculationResult {
  origin: {
    latitude: number;
    longitude: number;
    addressLine?: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    addressLine?: string;
  };
}

@Injectable()
export class CalculateDistanceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CalculateDistanceDto): Promise<DetailedDistanceResponse> {
    let originLat = dto.originLatitude;
    let originLng = dto.originLongitude;
    let originAddressLine: string | undefined;

    let destLat = dto.destinationLatitude;
    let destLng = dto.destinationLongitude;
    let destAddressLine: string | undefined;
    let providerServiceRadiusKm: number | undefined;

    // 1. Nếu có addressId, tra cứu tọa độ địa chỉ khách hàng trong DB
    if (dto.addressId) {
      const address = await this.prisma.customer_addresses.findUnique({
        where: { id: dto.addressId },
      });

      if (!address) {
        throw new NotFoundException(`Không tìm thấy địa chỉ khách hàng với ID: ${dto.addressId}`);
      }

      originLat = Number(address.latitude);
      originLng = Number(address.longitude);
      originAddressLine = address.formatted_address || address.address_line;
    }

    // 2. Nếu có providerId, tra cứu tọa độ cơ sở của đối tác trong DB
    if (dto.providerId) {
      const provider = await this.prisma.provider_profiles.findUnique({
        where: { id: dto.providerId },
      });

      if (!provider) {
        throw new NotFoundException(`Không tìm thấy hồ sơ đối tác với ID: ${dto.providerId}`);
      }

      if (!provider.base_latitude || !provider.base_longitude) {
        throw new BadRequestException('Đối tác này chưa thiết lập tọa độ cơ sở (Base Location).');
      }

      destLat = Number(provider.base_latitude);
      destLng = Number(provider.base_longitude);
      destAddressLine = provider.base_formatted || provider.base_address_line || undefined;
      providerServiceRadiusKm = provider.service_radius_km ? Number(provider.service_radius_km) : undefined;
    }

    // 3. Kiểm tra tính hợp lệ của tọa độ điểm xuất phát và điểm đích
    if (originLat === undefined || originLng === undefined) {
      throw new BadRequestException(
        'Thiếu tọa độ điểm xuất phát. Vui lòng truyền originLatitude & originLongitude hoặc addressId.',
      );
    }

    if (destLat === undefined || destLng === undefined) {
      throw new BadRequestException(
        'Thiếu tọa độ điểm đích. Vui lòng truyền destinationLatitude & destinationLongitude hoặc providerId.',
      );
    }

    if (isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng)) {
      throw new BadRequestException('Tọa độ kinh độ hoặc vĩ độ không hợp lệ.');
    }

    // 4. Tính toán khoảng cách thực tế ước tính qua GeoLocationHelper (Haversine * 1.3)
    const result = GeoLocationHelper.calculateRoadDistance(
      { latitude: originLat, longitude: originLng },
      { latitude: destLat, longitude: destLng },
      providerServiceRadiusKm,
    );

    return {
      ...result,
      origin: {
        latitude: originLat,
        longitude: originLng,
        addressLine: originAddressLine,
      },
      destination: {
        latitude: destLat,
        longitude: destLng,
        addressLine: destAddressLine,
      },
    };
  }
}
