import type { ProviderBookingItem } from '@/infrastructure/api/bookings.api';

// Memory store for mock booking status overrides
const mockBookingStatusMap: Record<string, string> = {};

export let fallbackProviderBookings: ProviderBookingItem[] = [
  {
    id: 'prov-bk-01',
    booking_code: 'BK-2026-9812',
    status: 'PENDING_PROVIDER_ACCEPTANCE',
    total_price: 250000,
    requested_date: '2026-09-24',
    estimated_start_at: '2026-09-24T09:00:00.000Z',
    estimated_end_at: '2026-09-24T10:00:00.000Z',
    service_duration_minutes: 60,
    created_at: '2026-09-24T08:00:00.000Z',
    customer_note: 'Bé hơi nhát người lạ, xin làm nhẹ tay',
    customer_addresses: {
      formatted_address: '123 Đường Nguyễn Trãi, Phường 2, Quận 5, TP.HCM',
      district: 'Quận 5',
      city: 'Hồ Chí Minh',
      receiver_name: 'Nguyễn Thu Hà',
      phone: '0987654321',
    },
    users: {
      fullName: 'Nguyễn Thu Hà',
      phone: '0987654321',
    },
    booking_pets: [
      {
        id: 'pet-01',
        pet_name: 'Milo',
        species: 'Chó',
        breed: 'Poodle',
        weight: 4.5,
        avatar_url:
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
        booking_services: [
          {
            id: 'srv-01',
            service_name: 'Tắm spa khử mùi',
            price: 250000,
            duration_minutes: 60,
          },
        ],
      },
    ],
  },
  {
    id: 'prov-bk-02',
    booking_code: 'BK-2026-9813',
    status: 'PENDING_PROVIDER_ACCEPTANCE',
    total_price: 380000,
    requested_date: '2026-09-24',
    estimated_start_at: '2026-09-24T14:00:00.000Z',
    estimated_end_at: '2026-09-24T15:30:00.000Z',
    service_duration_minutes: 90,
    created_at: '2026-09-24T08:15:00.000Z',
    customer_addresses: {
      formatted_address: '45 Lê Duẩn, Bến Nghé, Quận 1, TP.HCM',
      district: 'Quận 1',
      city: 'Hồ Chí Minh',
      receiver_name: 'Trần Minh Quân',
      phone: '0912345678',
    },
    users: {
      fullName: 'Trần Minh Quân',
      phone: '0912345678',
    },
    booking_pets: [
      {
        id: 'pet-02',
        pet_name: 'Bơ',
        species: 'Chó',
        breed: 'Corgi',
        weight: 11.0,
        avatar_url:
          'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80',
        booking_services: [
          {
            id: 'srv-02',
            service_name: 'Cắt tỉa lông tạo kiểu',
            price: 380000,
            duration_minutes: 90,
          },
        ],
      },
    ],
  },
  {
    id: 'prov-bk-03',
    booking_code: 'BK-2026-8741',
    status: 'IN_PROGRESS',
    total_price: 320000,
    requested_date: '2026-09-24',
    estimated_start_at: '2026-09-24T08:30:00.000Z',
    estimated_end_at: '2026-09-24T09:45:00.000Z',
    service_duration_minutes: 75,
    created_at: '2026-09-23T15:00:00.000Z',
    customer_addresses: {
      formatted_address: '72 Trần Quốc Thảo, Phường 9, Quận 3, TP.HCM',
      district: 'Quận 3',
      city: 'Hồ Chí Minh',
      receiver_name: 'Phạm Bích Ngọc',
      phone: '0908889999',
    },
    users: {
      fullName: 'Phạm Bích Ngọc',
      phone: '0908889999',
    },
    booking_pets: [
      {
        id: 'pet-03',
        pet_name: 'Lucky',
        species: 'Chó',
        breed: 'Phốc sóc (Pomeranian)',
        weight: 3.2,
        avatar_url:
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
        booking_services: [
          {
            id: 'srv-03',
            service_name: 'Combo chăm sóc toàn diện',
            price: 320000,
            duration_minutes: 75,
          },
        ],
      },
    ],
  },
  {
    id: 'prov-bk-04',
    booking_code: 'BK-2026-7711',
    status: 'ACCEPTED',
    total_price: 180000,
    requested_date: '2026-09-25',
    estimated_start_at: '2026-09-25T10:30:00.000Z',
    estimated_end_at: '2026-09-25T11:15:00.000Z',
    service_duration_minutes: 45,
    created_at: '2026-09-23T18:00:00.000Z',
    customer_addresses: {
      formatted_address: '10 Đường số 4, Tân Phú, Quận 7, TP.HCM',
      district: 'Quận 7',
      city: 'Hồ Chí Minh',
      receiver_name: 'Lê Hoàng Nam',
      phone: '0933221100',
    },
    users: {
      fullName: 'Lê Hoàng Nam',
      phone: '0933221100',
    },
    booking_pets: [
      {
        id: 'pet-04',
        pet_name: 'Miu Miu',
        species: 'Mèo',
        breed: 'Mèo Anh lông ngắn',
        weight: 3.8,
        avatar_url:
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
        booking_services: [
          {
            id: 'srv-04',
            service_name: 'Vệ sinh tai & cắt móng',
            price: 180000,
            duration_minutes: 45,
          },
        ],
      },
    ],
  },
];

export const getFallbackProviderBookings = (): ProviderBookingItem[] => {
  return fallbackProviderBookings.map((b) => {
    const override = mockBookingStatusMap[b.id];
    return override ? { ...b, status: override as any } : b;
  });
};

export const getFallbackBookingStatus = (id: string): string | undefined => {
  return mockBookingStatusMap[id];
};

export const updateFallbackBookingStatus = (id: string, newStatus: string) => {
  mockBookingStatusMap[id] = newStatus;
  fallbackProviderBookings = fallbackProviderBookings.map((b) =>
    b.id === id ? { ...b, status: newStatus as any } : b
  );
};
