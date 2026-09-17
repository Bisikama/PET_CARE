# Deferred Features

This document tracks all features that are intentionally deferred in this phase, primarily due to the **Booking Dependency Exception**.

| Feature | Required Booking dependency | Required backend APIs | Reason deferred | Future implementation phase |
| ------- | --------------------------- | --------------------- | --------------- | --------------------------- |
| Booking Creation | Needs a booking context | `POST /bookings` | Requires Booking | Phase 5 |
| Booking History | Needs booking records | `GET /bookings` | Requires Booking | Phase 5 |
| Booking Detail | Needs a booking ID | `GET /bookings/:id` | Requires Booking | Phase 5 |
| Booking Tracking | Needs active booking state| `GET /bookings/:id/tracking` | Requires Booking | Phase 6 |
| Booking Chat | Needs booking/room ID | `GET /api/chat/rooms` | Requires Booking | Phase 6 |
| Booking Payment | Needs booking ID/invoice | `POST /api/payments` | Requires Booking | Phase 6 |
| Booking Dispute | Needs a booking ID | `POST /customer-care/tickets` | Requires Booking | Phase 6 |
| Reviews | Needs completed booking | `POST /reviews` (if exists) | Requires Booking | Phase 6 |
| Provider Dashboard | Centers around active bookings | `GET /bookings` | Requires Booking | Phase 5 |
| Matching / Requests | Needs matching state | `POST /booking-matching` | Requires Booking | Phase 5 |
