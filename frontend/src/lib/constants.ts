export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SERVICES: '/services',
  BOOKINGS: '/bookings',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  SUPPORT: '/support',
  ADMIN_SUPPORT: '/admin/support',
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  VERIFY_EMAIL_OTP: '/auth/verify-email-otp',
  RESEND_CONFIRMATION_OTP: '/auth/resend-confirmation-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  SERVICES: '/services',
} as const;
