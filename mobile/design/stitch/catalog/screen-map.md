# PetCare Stitch Screen Map

## 1. Purpose

This file is the canonical mapping between:
- Stitch reference artifacts
- User-facing screen / flow
- React Native feature
- Suggested route
- Component dependencies
- Backend dependencies
- Current implementation status

## 2. Coverage Legend

- `DESIGNED` = dedicated Stitch screen artifact exists (`screen.png` and/or `code.html`)
- `FLOW_DERIVED` = required screen/step is described by Stitch master flows or existing designs but does not have a dedicated screen artifact in the uploaded repository
- `SYSTEM` = global design/technical reference, not a standalone app screen

Important finding:
The uploaded Stitch repository contains **dedicated screen designs for 4 Customer areas and 4 Provider areas**, plus a reusable component library and master flow specification. It does **not** contain a dedicated screen artifact for every business requirement listed in the original PetCare specification. Missing screens should be implemented from the master flow + Design System rather than invented arbitrarily.

---

## 3. Global / System References

| ID | Stitch Source | Type | React Native Mapping | Status |
|---|---|---|---|---|
| SYS-DS-01 | `01-design-system/petcare_design_system/` | Design System | `src/core/theme/*` | SYSTEM |
| SYS-BRAND-01 | `01-design-system/petcare_brand_logo/` | Brand / Logo | `assets/images` or `assets/icons` | SYSTEM |
| SYS-TRUST-01 | `01-design-system/warm_pet_trust/DESIGN.md` | Design language | `src/core/theme/*` + trust components | SYSTEM |
| SYS-COMP-01 | `02-components/petcare_reusable_component_library/` | Component library | `src/core/components/*` + feature components | SYSTEM |
| SYS-FLOW-01 | `05-flows/` | Master flow / UX audit | `design/stitch/catalog/user-flows.md` + routing | SYSTEM |

---

## 4. Customer — Auth

The original product requirements require Splash, Onboarding, Login, Register, Forgot Password, and OTP. The uploaded Stitch repository does not contain dedicated customer auth screenshots.

| ID | Screen / Step | Stitch Source | RN Feature | Suggested Route | Status |
|---|---|---|---|---|---|
| CUS-AUTH-01 | Splash | `05-flows/code.html` flow reference | `auth` | `/(auth)/index` | FLOW_DERIVED |
| CUS-AUTH-02 | Onboarding 1 | `05-flows/code.html` flow reference | `auth` | `/(auth)/onboarding` | FLOW_DERIVED |
| CUS-AUTH-03 | Onboarding 2 | `05-flows/code.html` flow reference | `auth` | `/(auth)/onboarding` | FLOW_DERIVED |
| CUS-AUTH-04 | Onboarding 3 | `05-flows/code.html` flow reference | `auth` | `/(auth)/onboarding` | FLOW_DERIVED |
| CUS-AUTH-05 | Login | `05-flows/code.html` flow reference | `auth` | `/(auth)/login` | FLOW_DERIVED |
| CUS-AUTH-06 | Register | `05-flows/code.html` flow reference | `auth` | `/(auth)/register` | FLOW_DERIVED |
| CUS-AUTH-07 | Phone OTP | `05-flows/code.html` flow reference | `auth` | `/(auth)/otp` | FLOW_DERIVED |
| CUS-AUTH-08 | Forgot / Reset Password | `05-flows/code.html` flow reference | `auth` | `/(auth)/forgot-password` | FLOW_DERIVED |

---

## 5. Customer — Dedicated Stitch Screens

### CUS-HOME-01 — Customer Home
Source:
`03-customer/customer_home/`

Observed UI:
- Greeting
- Location
- Notifications
- Family/pet profiles
- Search
- Explore Services
- Service categories
- Promotion banner
- Top Rated Sitters & Walkers
- Nearby active walkers
- Provider cards
- Quick Book
- Happiness Guarantee
- 5-tab navigation: Home / Explore / Bookings / Messages / Profile

RN:
`src/features/home/screens/HomeScreen.tsx`

Suggested route:
`app/(customer)/home/index.tsx`

Dependencies:
- `ProviderCard`
- `ServiceCard`
- `PromotionCard`
- `PetCard`
- `SearchBar`
- `Avatar`
- `TrustBadge`
- Customer tab navigation

Status: `DESIGNED`

---

### CUS-EXP-01 — Explore / Provider Discovery
Source:
`03-customer/explore_provider_discovery/`

Observed UI:
- Map/List switch
- Radius control
- Filters
- Rating filter
- Price filter
- Verified-safe filter
- Live walkers
- Provider pins
- Provider preview
- List of available walkers
- Expand search radius

RN:
`src/features/explore/screens/ExploreScreen.tsx`

Suggested routes:
- `app/(customer)/explore/index.tsx`
- `app/(customer)/explore/map.tsx`

Dependencies:
- `SearchBar`
- `FilterChip`
- `ProviderPin`
- `ServiceRadiusOverlay`
- `TravelDurationPill`
- `ProviderCard`
- `ProviderMapPreview`

Backend dependencies:
- provider discovery
- geo/radius search
- provider availability
- ratings/trust data

Status: `DESIGNED`

---

### CUS-PRO-01 — Provider Profile
Source:
`03-customer/provider_profile/`

Observed UI:
- Profile hero
- Availability
- Rating / reviews
- Verification
- Trust badges
- Experience
- Completed walks
- Repeat rate
- About
- Expertise tags
- Service package
- Service features
- Species + weight pricing matrix
- Portfolio gallery
- Client reviews
- Availability schedule
- Book Now

RN:
`src/features/providers/screens/ProviderProfileScreen.tsx`

Suggested route:
`app/(customer)/explore/provider/[id].tsx`

Dependencies:
- `ProviderHeader`
- `TrustBadge`
- `RatingSummary`
- `ServiceCard`
- `PricingMatrix`
- `ProviderPortfolioGallery`
- `ReviewCard`
- `AvailabilitySummary`
- `Booking CTA`

Backend dependencies:
- provider profile
- trust verification
- services
- pricing rules
- reviews
- service areas / availability

Status: `DESIGNED`

---

### CUS-BOOK-01 — Booking Checkout
Source:
`03-customer/booking_flow_checkout/`

Observed UI:
- Checkout stepper
- PetCare Safety Escrow
- Provider identity/trust
- Assigned pet
- Add another pet
- Weight tier
- Scheduled window
- Slot locked
- Pick-up address
- Promo code
- Payment methods
- Wallet
- Apple Pay
- Credit Card
- VNPay/MoMo QR gateway
- Pay after service / cash
- Receipt & cost summary
- Base price
- Large-pet surcharge
- Travel fee
- Promo discount
- Escrow protection fee
- Total due
- Cancellation policy
- Confirm & Pay

RN:
`src/features/bookings/screens/CheckoutScreen.tsx`
and related step screens

Suggested routes:
- `app/(customer)/bookings/create/service.tsx`
- `.../pet.tsx`
- `.../schedule.tsx`
- `.../address.tsx`
- `.../summary.tsx`
- `.../payment.tsx`
- `.../success.tsx`

Dependencies:
- `BookingStepper`
- `ServiceSelector`
- `PetSelector`
- `TimeSlotSelector`
- `AddressSelector`
- `PromotionInput`
- `PaymentMethodCard`
- `PriceBreakdown`
- `CancellationPolicy`

Backend dependencies:
- provider/service data
- pet data
- availability
- pricing
- promotions
- location/travel fee
- payment
- booking creation
- escrow/payment state

Status: `DESIGNED`

---

## 6. Customer — Screens Required by Product Spec but Not Yet Dedicated in Stitch

These are not missing from the product plan; they are simply not represented by standalone Stitch screen artifacts in the uploaded repository.

| ID | Required Screen | RN Feature | Suggested Route | Status |
|---|---|---|---|---|
| CUS-PET-01 | Pet List | `pets` | `profile/pets/index` | FLOW_DERIVED |
| CUS-PET-02 | Add Pet | `pets` | `profile/pets/add` | FLOW_DERIVED |
| CUS-PET-03 | Edit Pet | `pets` | `profile/pets/[id]/edit` | FLOW_DERIVED |
| CUS-PET-04 | Pet Detail | `pets` | `profile/pets/[id]` | FLOW_DERIVED |
| CUS-ADR-01 | Address List | `addresses` | `profile/addresses/index` | FLOW_DERIVED |
| CUS-ADR-02 | Add/Edit Address | `addresses` | `profile/addresses/add` / `edit` | FLOW_DERIVED |
| CUS-BKG-01 | Booking List | `bookings` | `bookings/index` | FLOW_DERIVED |
| CUS-BKG-02 | Booking Detail | `bookings` | `bookings/[id]` | FLOW_DERIVED |
| CUS-TRK-01 | Live Booking Tracking | `bookings` | `bookings/[id]/tracking` | FLOW_DERIVED |
| CUS-CAN-01 | Cancel Booking | `bookings` | `bookings/[id]/cancel` | FLOW_DERIVED |
| CUS-PAY-01 | Payment Processing | `payments` | booking payment flow | FLOW_DERIVED |
| CUS-WAL-01 | Customer Wallet | `wallet` | `profile/wallet` | FLOW_DERIVED |
| CUS-WAL-02 | Wallet Transactions | `wallet` | `profile/wallet/transactions` | FLOW_DERIVED |
| CUS-CHAT-01 | Chat List | `chat` | `chat/index` | FLOW_DERIVED |
| CUS-CHAT-02 | Chat Detail | `chat` | `chat/[bookingId]` | FLOW_DERIVED |
| CUS-REV-01 | Review Composer | `reviews` | `bookings/[id]/review` | FLOW_DERIVED |
| CUS-CMP-01 | Create Complaint / Incident | `complaints` | `profile/complaints/create` | FLOW_DERIVED |
| CUS-CMP-02 | Incident Detail | `complaints` | `profile/complaints/[id]` | FLOW_DERIVED |
| CUS-SUP-01 | Help Center | `support` | `profile/support` | FLOW_DERIVED |
| CUS-SUP-02 | Support Ticket | `support` | `profile/support/[id]` | FLOW_DERIVED |
| CUS-NOT-01 | Notification Center | `notifications` | `home/notifications` | FLOW_DERIVED |
| CUS-PROF-01 | Customer Profile | `home/profile` | `profile/index` | FLOW_DERIVED |
| CUS-SET-01 | Profile / Notification Settings | `notifications` / profile | `profile/settings` | FLOW_DERIVED |

---

## 7. Provider — Dedicated Stitch Screens

### PRO-KYC-01 — Provider Verification & KYC
Source:
`04-provider/provider_kyc_credentials/`

Observed UI:
- Provider onboarding
- Step 3 of 4
- Under Review
- Estimated completion
- Verification status stepper
- Government Photo ID
- Front / Back document
- Barcode read
- Biometric facial match
- Certifications & Training
- Background check
- Service area coverage
- Radius
- Included neighborhoods
- Base walking / sitting rates
- Privacy / encryption notice
- Save & Return to Dashboard
- Edit Documents / Add Certificate

RN:
`src/features/provider/kyc/screens/KycScreen.tsx`

Suggested route:
`app/(provider)/profile/kyc/index.tsx`

Dependencies:
- `KycStepper`
- `IdentityDocumentUploader`
- `DocumentPreview`
- `FaceVerificationCard`
- `CertificateUploader`
- `VerificationStatus`
- `ServiceAreaMap` / summary
- pricing summary

Backend dependencies:
- provider onboarding
- KYC
- credentials
- certificates
- background verification
- service area
- provider pricing

Status: `DESIGNED`

---

### PRO-DASH-01 — Provider Dashboard / Live Schedule
Source:
`04-provider/provider_dashboard_live_schedule/`

Observed UI:
- Online state
- Provider verification
- Today's earnings
- Pending bookings
- Completed jobs
- Rating
- Active/upcoming booking
- Transit action
- New request cards
- Accept / Decline
- Today's schedule
- Provider tools
- My Services
- Pricing
- Service Area
- Hours
- Cash Out
- 5-tab Provider navigation

RN:
`src/features/provider/dashboard/screens/ProviderDashboardScreen.tsx`

Suggested route:
`app/(provider)/dashboard/index.tsx`

Dependencies:
- `EarningsSummaryCard`
- `BookingRequestCard`
- `JobCard`
- `ScheduleSlot`
- `StatusBadge`
- provider bottom navigation

Backend dependencies:
- provider profile/verification
- bookings
- schedules
- earnings
- provider services

Status: `DESIGNED`

---

### PRO-CHECK-01 — Live Service Execution / Care Checklist
Source:
`04-provider/live_service_execution_care_checklist/`

Observed UI:
- Live walk tracker
- Job ID
- Active timer
- Status stepper: Confirmed / Transit / Arrived / Walking / Done
- Pet data and safety notes
- Address
- Call / Chat
- Live GPS route & metrics
- Water / pee / poop telemetry
- Distance / pace
- Care checklist
- Completed/in-progress tasks
- Owner notes
- Live media count
- Add photo
- Owner notification
- Auto-saving visit notes
- Complete Service / Request Sign-off
- Safety guarantee

RN:
`src/features/provider/jobs/screens/ActiveJobScreen.tsx`

Suggested route:
`app/(provider)/jobs/[id].tsx`

Dependencies:
- `JobProgressTimeline`
- `ServiceChecklist`
- `ServiceChecklistItem`
- `BookingMediaGallery`
- `ServiceNoteEditor`
- map/tracking
- `BookingChatContext`

Backend dependencies:
- booking state
- realtime tracking
- GPS telemetry
- checklist
- media upload
- notes
- owner notification
- completion/sign-off

Status: `DESIGNED`

---

### PRO-WALLET-01 — Provider Earnings / Wallet / Payouts
Source:
`04-provider/provider_earnings_wallet_payouts/`

Observed UI:
- Available balance
- Pending escrow clearance
- Instant withdrawal
- Bank accounts
- Daily/weekly/monthly/lifetime performance
- Gross bookings
- Platform fee
- Tips
- Deposit accounts
- Activity & payouts
- Escrow released
- Withdrawal
- Platform escrow fee
- Add New Bank Account
- PetCare Escrow Guarantee

RN:
`src/features/provider/wallet/screens/ProviderWalletScreen.tsx`
and/or `src/features/provider/earnings/screens/EarningsScreen.tsx`

Suggested routes:
- `app/(provider)/profile/wallet/index.tsx`
- `app/(provider)/profile/earnings/index.tsx`

Dependencies:
- `ProviderWalletCard`
- `EarningsSummaryCard`
- `PerformanceChart`
- `BankAccountCard`
- `WithdrawalSummary`
- `WalletTransactionCard`

Backend dependencies:
- provider wallet
- settlements
- platform fees
- payout requests
- bank accounts
- escrow clearance

Status: `DESIGNED`

---

## 8. Provider — Screens Required by Product Spec but Not Yet Dedicated in Stitch

| ID | Required Screen | RN Feature | Suggested Route | Status |
|---|---|---|---|---|
| PRO-ONB-01 | Become Provider / Benefits | `provider/onboarding` | `profile/become-provider` | FLOW_DERIVED |
| PRO-ONB-02 | Provider Registration | `provider/onboarding` | onboarding flow | FLOW_DERIVED |
| PRO-KYC-02 | Identity Capture / Face Capture | `provider/kyc` | kyc steps | FLOW_DERIVED |
| PRO-KYC-03 | Certificate Upload | `provider/kyc` | kyc/certificates | FLOW_DERIVED |
| PRO-REQ-01 | Booking Requests List | `provider/jobs` | `jobs/index` | FLOW_DERIVED |
| PRO-REQ-02 | Booking Request Detail | `provider/jobs` | `jobs/request/[id]` | FLOW_DERIVED |
| PRO-SCH-01 | Schedule Calendar | `provider/schedule` | `schedule/index` | FLOW_DERIVED |
| PRO-SCH-02 | Working Days | `provider/schedule` | `schedule/working-days` | FLOW_DERIVED |
| PRO-SCH-03 | Blocked Time Slot Editor | `provider/schedule` | `schedule/[date]` | FLOW_DERIVED |
| PRO-SVC-01 | My Services | `provider/services` | `profile/services` | FLOW_DERIVED |
| PRO-PRICE-01 | Pricing Rules | `provider/pricing` | `profile/pricing` | FLOW_DERIVED |
| PRO-AREA-01 | Service Areas | `provider/areas` | `profile/areas` | FLOW_DERIVED |
| PRO-JOB-02 | Job Completion / Success | `provider/jobs` | `jobs/[id]/success` | FLOW_DERIVED |
| PRO-WALLET-02 | Withdrawal Flow | `provider/wallet` | `profile/wallet/withdraw` | FLOW_DERIVED |
| PRO-BANK-01 | Bank Account Management | `provider/wallet` | `profile/bank-accounts` | FLOW_DERIVED |
| PRO-CHAT-01 | Provider Chat List | `chat` | `chat/index` | FLOW_DERIVED |
| PRO-CHAT-02 | Provider Chat Detail | `chat` | `chat/[bookingId]` | FLOW_DERIVED |
| PRO-PROF-01 | Provider Profile / Settings | `provider/profile` | `profile/index` | FLOW_DERIVED |
| PRO-NOT-01 | Provider Notifications | `notifications` | provider notification route | FLOW_DERIVED |

---

## 9. Master Flow Mappings

### Customer Discovery → Booking → Live Walk

Source:
`05-flows/code.html`

Flow:
Home
→ Explore / Radius Radar
→ Provider Profile
→ Booking Checkout
→ Escrow Payment
→ Live Walk Tracking
→ Review

Mapping:
- `CUS-HOME-01`
- `CUS-EXP-01`
- `CUS-PRO-01`
- `CUS-BOOK-01`
- `CUS-TRK-01` (flow-derived)
- `CUS-REV-01` (flow-derived)

---

### Provider Request → Service Execution → Payout

Flow:
Dashboard Alert
→ Booking Request
→ Accept
→ Live Service Execution
→ Checklist / Media
→ Complete
→ Wallet Clearance
→ Instant Withdrawal

Mapping:
- `PRO-DASH-01`
- `PRO-REQ-01`
- `PRO-CHECK-01`
- `PRO-WALLET-01`
- `PRO-WALLET-02` (flow-derived)

---

### Customer → Provider Onboarding & KYC

Flow:
Profile
→ Become Provider
→ Personal Info & Experience
→ Identity Upload
→ Face Match
→ Certification Upload
→ Background Check
→ Under Review
→ Verified
→ Provider Pro Mode

Mapping:
- `CUS-PROF-01`
- `PRO-ONB-01`
- `PRO-ONB-02`
- `PRO-KYC-01`
- `PRO-KYC-02`
- `PRO-KYC-03`

---

## 10. Realtime / System References from Master Flow

The Stitch master flow explicitly references:
- realtime GPS route
- WebSocket dispatch
- checklist updates
- owner notification
- offline mode
- route/checklist local caching
- escrow guarantee
- role switching

These are not standalone screenshots; they are implementation/system behavior references.

Recommended technical mapping:
- booking realtime → `src/infrastructure/realtime`
- chat realtime → `src/infrastructure/realtime`
- push notifications → `src/infrastructure/notifications`
- map/GPS → `src/infrastructure/location`
- upload → `src/infrastructure/storage`
- payments → `src/infrastructure/payments`

---

## 11. Implementation Rule

For every screen:

Stitch reference
→ Design tokens
→ Reusable components
→ Feature screen
→ Route
→ API/data hooks
→ realtime where needed
→ loading/empty/error/success states

Do not use the screenshot itself as the production UI.
