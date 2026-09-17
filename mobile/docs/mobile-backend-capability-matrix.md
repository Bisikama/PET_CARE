# PetCare Mobile - Backend Capability Matrix

This document maps all identified backend modules to their implementation status in the PetCare Mobile Application, in accordance with the **Backend-First Rule** and **Booking Dependency Exception**.

| Backend Module | API | Role | Mobile Screen | Booking Dependency | Action |
| -------------- | --- | ---- | ------------- | ------------------ | ------ |
| Auth | `POST /auth/login` | CUSTOMER/PROVIDER | Login | No | IMPLEMENT NOW |
| Auth | `POST /auth/register` | CUSTOMER | Register | No | IMPLEMENT NOW |
| Auth | `POST /auth/refresh` | ALL | (Background) | No | IMPLEMENT NOW |
| Users | `GET /users/me` | CUSTOMER/PROVIDER | Profile | No | IMPLEMENT NOW |
| Users | `PATCH /users/me` | CUSTOMER/PROVIDER | Edit Profile | No | IMPLEMENT NOW |
| Pets | `GET /pets` | CUSTOMER | Pet List | No | IMPLEMENT NOW |
| Pets | `GET /pets/:id` | CUSTOMER | Pet Detail | No | IMPLEMENT NOW |
| Pets | `POST /pets` | CUSTOMER | Add Pet | No | IMPLEMENT NOW |
| Pets | `PATCH /pets/:id` | CUSTOMER | Edit Pet | No | IMPLEMENT NOW |
| Pets | `DELETE /pets/:id` | CUSTOMER | Delete Pet | No | IMPLEMENT NOW |
| Customer Addresses | `GET /customer-addresses` | CUSTOMER | Address List | No | IMPLEMENT NOW |
| Customer Addresses | `POST /customer-addresses` | CUSTOMER | Add Address | No | IMPLEMENT NOW |
| Customer Addresses | `PATCH /customer-addresses/:id` | CUSTOMER | Edit Address | No | IMPLEMENT NOW |
| Customer Addresses | `DELETE /customer-addresses/:id` | CUSTOMER | Delete Address | No | IMPLEMENT NOW |
| Services | `GET /services` | CUSTOMER | Explore / Services | No | IMPLEMENT NOW |
| Services | `GET /services/:id` | CUSTOMER | Service Detail | No | IMPLEMENT NOW |
| Service Discovery | `GET /service-discovery/providers` | CUSTOMER | Choose Provider | No | IMPLEMENT NOW |
| Service Discovery | `GET /service-discovery/recommendations` | CUSTOMER | Home (Nearby/Top) | No | IMPLEMENT NOW |
| Service Discovery | `GET /service-discovery/providers/:id` | CUSTOMER | Provider Profile | No | IMPLEMENT NOW |
| Wallets | `GET /wallets/me` | CUSTOMER/PROVIDER | Wallet | No | IMPLEMENT NOW |
| Wallets | `GET /wallets/me/transactions` | CUSTOMER/PROVIDER | Wallet History | No | IMPLEMENT NOW |
| Promotions | `GET /api/promotions` | CUSTOMER | Promotions | No | IMPLEMENT NOW |
| Notifications | `GET /notifications` | CUSTOMER/PROVIDER | Notifications | No | IMPLEMENT NOW |
| Providers | `GET /providers/me` | PROVIDER | Provider Profile | No | IMPLEMENT NOW |
| Providers | `PATCH /providers/me` | PROVIDER | Edit Provider | No | IMPLEMENT NOW |
| Provider Schedules | `GET /provider-schedules` | PROVIDER | My Schedule | No | IMPLEMENT NOW |
| Provider Coverage | `GET /provider-service-areas`| PROVIDER | Service Areas | No | IMPLEMENT NOW |
| Provider Coverage | `POST /provider-service-areas`| PROVIDER | Add Area | No | IMPLEMENT NOW |
| Bookings | `POST /bookings` | CUSTOMER | Checkout/Booking | **YES** | **DEFER** |
| Bookings | `GET /bookings` | CUSTOMER/PROVIDER | Booking History | **YES** | **DEFER** |
| Bookings | `PATCH /bookings/:id` | CUSTOMER/PROVIDER | Update Booking | **YES** | **DEFER** |
| Booking Matching | `POST /booking-matching` | CUSTOMER/PROVIDER | Matching Logic | **YES** | **DEFER** |
| Chat | `GET /api/chat/rooms` | CUSTOMER/PROVIDER | Chat | **YES** | **DEFER** |
| Customer Care | `POST /customer-care/tickets`| CUSTOMER | Booking Dispute | **YES** | **DEFER** |
| Payments | `POST /api/payments` | CUSTOMER | Payment | **YES** | **DEFER** |
| Settlements | `POST /admin/settlements` | ADMIN | Admin Settlement | No | DEFER - Admin only |
| Admin Core | `GET /admin/dashboard` | ADMIN | Admin Dashboard | No | DEFER - Admin only |
