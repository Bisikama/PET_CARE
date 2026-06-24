export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PETS: '/pets',
  BOOKINGS: '/bookings',
  SERVICES: '/services',
  PROFILE: '/profile',
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  PROFILE: '/auth/profile',
  PETS: '/pets',
  BOOKINGS: '/bookings',
  SERVICES: '/services',
} as const;
