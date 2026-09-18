# Mobile Screen to API Mapping

This document enforces traceability between every mobile screen and its supporting backend API.

| Screen | Feature | Backend Module | API | Method | Role | Status |
| ------ | ------- | -------------- | --- | ------ | ---- | ------ |
| Customer Login | Authentication | Auth | `/auth/login` | POST | CUSTOMER | Implement |
| Customer Register | Authentication | Auth | `/auth/register` | POST | CUSTOMER | Implement |
| Customer Home | Provider Discovery | Service Discovery | `/service-discovery/recommendations` | GET | CUSTOMER | Implement |
| Customer Profile | User Management | Users | `/users/me` | GET | CUSTOMER | Implement |
| Pet List | Pet Management | Pets | `/pets` | GET | CUSTOMER | Implement |
| Pet Detail | Pet Management | Pets | `/pets/:id` | GET | CUSTOMER | Implement |
| Add/Edit Pet | Pet Management | Pets | `/pets` & `/pets/:id` | POST/PATCH | CUSTOMER | Implement |
| Address List | Addresses | Customer Addresses| `/customer-addresses` | GET | CUSTOMER | Implement |
| Add/Edit Address | Addresses | Customer Addresses| `/customer-addresses` | POST/PATCH | CUSTOMER | Implement |
| Explore Services | Services | Services | `/services` | GET | CUSTOMER | Implement |
| Service Details | Services | Services | `/services/:id` | GET | CUSTOMER | Implement |
| Choose Provider | Provider Discovery | Service Discovery | `/service-discovery/providers` | GET | CUSTOMER | Implement |
| Provider Profile | Provider Discovery | Service Discovery | `/service-discovery/providers/:id` | GET | CUSTOMER | Implement |
| Wallet | Wallet | Wallets | `/wallets/me` | GET | CUSTOMER | Implement |
| Promotions | Promotions | Promotions | `/api/promotions` | GET | CUSTOMER | Implement |
| Provider Login | Authentication | Auth | `/auth/login` | POST | PROVIDER | Implement |
| Provider Home | Dashboard | Bookings | *N/A (Booking)* | *N/A* | PROVIDER | **DEFER** |
| Provider Profile | Provider Mgmt | Providers | `/providers/me` | GET | PROVIDER | Implement |
| Provider Services| Provider Mgmt | Providers | `/providers/me/services` | GET | PROVIDER | Implement |
| Service Areas | Provider Coverage | Provider Coverage | `/provider-service-areas` | GET | PROVIDER | Implement |
| Schedules | Provider Schedules| Provider Schedules| `/provider-schedules` | GET | PROVIDER | Implement |
| Wallet (Provider)| Wallet | Wallets | `/wallets/me` | GET | PROVIDER | Implement |
