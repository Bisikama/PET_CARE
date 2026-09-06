export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DistanceCalculationResult {
  straightLineDistanceKm: number;
  estimatedRoadDistanceKm: number;
  roadFactor: number;
  estimatedDurationMinutes: number;
  travelSurcharge: number;
  isWithinServiceRadius?: boolean;
  serviceRadiusKm?: number;
  pricingFormula: {
    freeDistanceKm: number;
    ratePerKm: number;
    chargeableDistanceKm: number;
  };
}

export class GeoLocationHelper {
  // Bán kính Trái Đất (km)
  public static readonly EARTH_RADIUS_KM = 6371;

  // Hệ số khúc quanh đường bộ tại đô thị Việt Nam (Đường thực tế ≈ 1.3 * đường chim bay)
  public static readonly ROAD_WINDING_FACTOR = 1.3;

  // Tốc độ di chuyển trung bình trong đô thị (25 km/h cho xe máy)
  public static readonly AVERAGE_SPEED_KMH = 25;

  // Bán kính miễn phí phụ phí di chuyển (2 km đầu miễn phí)
  public static readonly FREE_DISTANCE_KM = 2.0;

  // Phụ phí mỗi km phát sinh vượt định mức (5.000 VNĐ / km)
  public static readonly SURCHARGE_PER_KM = 5000;

  /**
   * Tính khoảng cách đường chim bay theo công thức Haversine
   */
  static calculateHaversineDistance(origin: Coordinates, destination: Coordinates): number {
    const lat1 = Number(origin.latitude);
    const lon1 = Number(origin.longitude);
    const lat2 = Number(destination.latitude);
    const lon2 = Number(destination.longitude);

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = this.EARTH_RADIUS_KM * c;

    return Number(distance.toFixed(2));
  }

  /**
   * Tính toán khoảng cách thực tế ước tính (Road Distance)
   * Áp dụng hệ số 1.3 kèm ước lượng thời gian và phụ phí di chuyển
   */
  static calculateRoadDistance(
    origin: Coordinates,
    destination: Coordinates,
    serviceRadiusKm?: number,
  ): DistanceCalculationResult {
    const straightLine = this.calculateHaversineDistance(origin, destination);
    const roadDistance = Number((straightLine * this.ROAD_WINDING_FACTOR).toFixed(2));

    // Thời gian di chuyển (phút) = (khoảng cách / 25 km/h) * 60
    const durationMinutes = Math.max(1, Math.round((roadDistance / this.AVERAGE_SPEED_KMH) * 60));

    // Tính phụ phí di chuyển vượt mức
    const chargeableDistance = Math.max(0, Number((roadDistance - this.FREE_DISTANCE_KM).toFixed(2)));
    const travelSurcharge = Math.round(chargeableDistance * this.SURCHARGE_PER_KM);

    const isWithinRadius =
      serviceRadiusKm !== undefined ? roadDistance <= serviceRadiusKm : undefined;

    return {
      straightLineDistanceKm: straightLine,
      estimatedRoadDistanceKm: roadDistance,
      roadFactor: this.ROAD_WINDING_FACTOR,
      estimatedDurationMinutes: durationMinutes,
      travelSurcharge,
      isWithinServiceRadius: isWithinRadius,
      serviceRadiusKm,
      pricingFormula: {
        freeDistanceKm: this.FREE_DISTANCE_KM,
        ratePerKm: this.SURCHARGE_PER_KM,
        chargeableDistanceKm: chargeableDistance,
      },
    };
  }
}
