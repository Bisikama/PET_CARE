import { useState, useEffect, useCallback } from 'react';
import { bookingService } from '../services/booking.service';

export interface DiscoveredProvider {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  experienceYears: number;
  ratingAvg: number;
  totalReviews: number;
  totalCompletedBookings: number;
  price: number;
  durationMinutes: number;
  kycStatus: string;
  trustBadges: { code: string; name: string }[];
  hasSlotTomorrow: boolean;
  servesDistrict: boolean;
  score: number;
  recommendationReasons: string[];
}

export function useDiscoverProviders(params: {
  serviceId: string | null;
  petId: string | null;
  addressId: string | null;
}) {
  const [providers, setProviders] = useState<DiscoveredProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    if (!params.serviceId || !params.petId || !params.addressId) {
      setProviders([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await bookingService.discoverProviders({
        serviceId: params.serviceId,
        petId: params.petId,
        addressId: params.addressId,
      });
      setProviders(data);
    } catch (err: any) {
      console.error('Error discovering providers details:', err?.response?.data);
      const errorMsg = err?.response?.data?.message;
      const msg = Array.isArray(errorMsg)
        ? errorMsg.join(', ')
        : typeof errorMsg === 'string'
        ? errorMsg
        : err?.message || 'Không thể tìm chuyên viên phù hợp.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [params.serviceId, params.petId, params.addressId]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return {
    providers,
    isLoading,
    error,
    refetch: fetchProviders,
  };
}
