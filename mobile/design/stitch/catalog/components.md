# PetCare Stitch Component Catalog

## 1. Source References

Primary sources:
- `01-design-system/petcare_design_system/`
- `02-components/petcare_reusable_component_library/`
- `03-customer/*/`
- `04-provider/*/`
- `05-flows/DESIGN.md`

Rule:
- Generic UI → `src/core/components/`
- PetCare business UI → `src/features/<feature>/components/`
- Stitch screenshots → visual reference only
- Stitch HTML → web reference only

---

## 2. Core Generic Components

| Component | Evidence / design | Canonical code destination | Priority |
|---|---|---|---|
| Button | Primary, Secondary, Outline, Ghost, FAB | `src/core/components/Button` | P0 |
| Input | 48px, 12px radius, focus/error states | `src/core/components/Input` | P0 |
| OTPInput | 48×56px boxes | `src/core/components/OTPInput` | P0 |
| Card | Warm white/white, 16px radius, Level 1 | `src/core/components/Card` | P0 |
| Avatar | Circle / rounded square | `src/core/components/Avatar` | P0 |
| Badge | Pill status / metadata | `src/core/components/Badge` | P0 |
| BottomSheet | 24px top radius, Level 3 | `src/core/components/BottomSheet` | P0 |
| IconButton | Repeated icon-only controls across screens | `src/core/components/IconButton` | P0 |
| SearchBar | Search field shown in Home/Explore | `src/core/components/SearchBar` | P0 |
| FilterChip | Explore filters / category controls | `src/core/components/FilterChip` | P0 |
| Tabs / SegmentedControl | Explore view, booking sections | `src/core/components/SegmentedControl` | P0 |
| StatusBadge | Typed semantic status presentation | `src/core/components/StatusBadge` | P0 |
| Modal / Dialog | Confirmations and system prompts | `src/core/components/Modal` | P1 |
| Skeleton | Loading states | `src/core/components/Skeleton` | P1 |
| EmptyState | System empty states | `src/core/components/EmptyState` | P1 |
| ErrorState | Recoverable error UI | `src/core/components/ErrorState` | P1 |
| Toast / Snackbar | Transient feedback | `src/core/components/Toast` | P1 |

---

## 3. Customer Business Components

### Pet

| Component | Purpose | Destination |
|---|---|---|
| `PetCard` | Pet summary in lists / selection | `src/features/pets/components/PetCard` |
| `PetShowcaseCard` | Rich pet image / summary | `src/features/pets/components/PetShowcaseCard` |
| `PetSelector` | Multi-pet selection during booking | `src/features/pets/components/PetSelector` |
| `PetHealthSummary` | Health / behavior notes | `src/features/pets/components/PetHealthSummary` |

### Provider

| Component | Purpose | Destination |
|---|---|---|
| `ProviderCard` | Discovery/home provider card | `src/features/providers/components/ProviderCard` |
| `ProviderHeader` | Profile identity and rating | `src/features/providers/components/ProviderHeader` |
| `ProviderPortfolioGallery` | Portfolio media | `src/features/providers/components/ProviderPortfolioGallery` |
| `TrustBadge` | Verified / ID / Top Rated | `src/features/providers/components/TrustBadge` |
| `RatingSummary` | Rating and review summary | `src/features/providers/components/RatingSummary` |
| `ServiceCard` | Provider service package | `src/features/services/components/ServiceCard` |
| `PricingMatrix` | Species/weight-based pricing | `src/features/providers/components/PricingMatrix` |
| `AvailabilitySummary` | Working schedule / next slot | `src/features/providers/components/AvailabilitySummary` |

### Explore / Map

| Component | Purpose | Destination |
|---|---|---|
| `ProviderPin` | Map marker | `src/features/explore/components/ProviderPin` |
| `ServiceRadiusOverlay` | Search/service radius | `src/features/explore/components/ServiceRadiusOverlay` |
| `TravelDurationPill` | Travel duration / distance | `src/features/explore/components/TravelDurationPill` |
| `ProviderMapPreview` | Selected provider bottom sheet | `src/features/explore/components/ProviderMapPreview` |

### Booking

| Component | Purpose | Destination |
|---|---|---|
| `BookingCard` | Booking summary in lists | `src/features/bookings/components/BookingCard` |
| `BookingStatusBadge` | Requested/confirmed/in-progress/etc. | `src/features/bookings/components/BookingStatusBadge` |
| `BookingStepper` | Multi-step checkout | `src/features/bookings/components/BookingStepper` |
| `ServiceSelector` | Service selection | `src/features/bookings/components/ServiceSelector` |
| `TimeSlotSelector` | Availability selection | `src/features/bookings/components/TimeSlotSelector` |
| `AddressSelector` | Saved address selection | `src/features/bookings/components/AddressSelector` |
| `PromotionInput` | Apply/remove promo code | `src/features/bookings/components/PromotionInput` |
| `PriceBreakdown` | Base/add-ons/travel/discount/total | `src/features/bookings/components/PriceBreakdown` |
| `CancellationPolicy` | Refund/penalty policy display | `src/features/bookings/components/CancellationPolicy` |
| `BookingStatusTimeline` | Live state timeline | `src/features/bookings/components/BookingStatusTimeline` |

### Payment / Wallet

| Component | Purpose | Destination |
|---|---|---|
| `PaymentMethodCard` | Cash/Wallet/MoMo/VNPay/Bank | `src/features/payments/components/PaymentMethodCard` |
| `PaymentStatus` | Pending/processing/success/failed/refunded | `src/features/payments/components/PaymentStatus` |
| `WalletBalanceCard` | Customer wallet balance | `src/features/wallet/components/WalletBalanceCard` |
| `WalletTransactionCard` | Deposit/payment/refund/adjustment | `src/features/wallet/components/WalletTransactionCard` |

### Communication / Trust & Safety

| Component | Purpose | Destination |
|---|---|---|
| `ChatConversationCard` | Conversation list | `src/features/chat/components/ChatConversationCard` |
| `ChatMessageBubble` | Text/image/video messages | `src/features/chat/components/ChatMessageBubble` |
| `BookingChatContext` | Booking context banner | `src/features/chat/components/BookingChatContext` |
| `ReviewCard` | Customer review | `src/features/reviews/components/ReviewCard` |
| `ReviewComposer` | Rating + text + media | `src/features/reviews/components/ReviewComposer` |
| `IncidentStatus` | Complaint state | `src/features/complaints/components/IncidentStatus` |
| `IncidentTimeline` | Complaint progress / admin response | `src/features/complaints/components/IncidentTimeline` |
| `EvidenceUploader` | Complaint media evidence | `src/features/complaints/components/EvidenceUploader` |
| `SupportTicketCard` | Support ticket list | `src/features/support/components/SupportTicketCard` |

---

## 4. Provider Business Components

### Provider Booking / Job

| Component | Purpose | Destination |
|---|---|---|
| `BookingRequestCard` | New booking request | `src/features/provider/jobs/components/BookingRequestCard` |
| `JobCard` | Upcoming/current jobs | `src/features/provider/jobs/components/JobCard` |
| `JobProgressTimeline` | Confirmed → Transit → Arrived → Walking → Done | `src/features/provider/jobs/components/JobProgressTimeline` |
| `ServiceChecklist` | Care task checklist | `src/features/provider/jobs/components/ServiceChecklist` |
| `ServiceChecklistItem` | Individual task | `src/features/provider/jobs/components/ServiceChecklistItem` |
| `BookingMediaGallery` | During/after-service media | `src/features/provider/jobs/components/BookingMediaGallery` |
| `ServiceNoteEditor` | Visit notes | `src/features/provider/jobs/components/ServiceNoteEditor` |

### Provider KYC

| Component | Purpose | Destination |
|---|---|---|
| `KycStepper` | 4-step onboarding | `src/features/provider/kyc/components/KycStepper` |
| `IdentityDocumentUploader` | Government ID front/back | `src/features/provider/kyc/components/IdentityDocumentUploader` |
| `DocumentPreview` | 3:4 credential preview | `src/features/provider/kyc/components/DocumentPreview` |
| `FaceVerificationCard` | Biometric face match | `src/features/provider/kyc/components/FaceVerificationCard` |
| `CertificateUploader` | Professional certificates | `src/features/provider/kyc/components/CertificateUploader` |
| `VerificationStatus` | Draft/submitted/reviewed/verified/rejected | `src/features/provider/kyc/components/VerificationStatus` |
| `RejectionReason` | Explain remediation | `src/features/provider/kyc/components/RejectionReason` |

### Provider Operations

| Component | Purpose | Destination |
|---|---|---|
| `EarningsSummaryCard` | Today/week/month earnings | `src/features/provider/earnings/components/EarningsSummaryCard` |
| `PerformanceChart` | Earnings performance | `src/features/provider/earnings/components/PerformanceChart` |
| `ScheduleSlot` | Available/booked/blocked slot | `src/features/provider/schedule/components/ScheduleSlot` |
| `WorkingDayEditor` | Full-time/part-time day config | `src/features/provider/schedule/components/WorkingDayEditor` |
| `ServiceConfigurationCard` | Enable/disable service | `src/features/provider/services/components/ServiceConfigurationCard` |
| `PricingRuleEditor` | Species + weight + price + duration | `src/features/provider/pricing/components/PricingRuleEditor` |
| `ServiceAreaMap` | Radius / districts / wards | `src/features/provider/areas/components/ServiceAreaMap` |
| `ProviderWalletCard` | Available/pending balance | `src/features/provider/wallet/components/ProviderWalletCard` |
| `BankAccountCard` | Linked payout account | `src/features/provider/wallet/components/BankAccountCard` |
| `WithdrawalSummary` | Amount/fee/final payout | `src/features/provider/wallet/components/WithdrawalSummary` |

---

## 5. Shared Component Reciprocity

The master flow explicitly describes cross-role reciprocity:

Customer booking card
↔
Provider booking request card

Customer booking status
↔
Provider service progress

Customer pet pricing
↔
Provider pricing matrix

Customer review
↔
Provider reputation

Implement shared low-level UI primitives, but keep business components domain-specific.

---

## 6. Component State Requirements

Every reusable interactive component should define states as applicable:

- default
- pressed
- focused
- disabled
- loading
- error
- success
- selected
- unselected
- empty
- offline where relevant

Do not encode backend state transitions inside generic components.

---

## 7. Important Rule

Do NOT copy Stitch `code.html` into React Native.

Recreate the component using native React Native primitives and the PetCare design tokens.



---

## 8. Observed Component-Library Examples from Stitch

The reusable component-library HTML contains examples of:
- Search bar + tune/filter
- All Pets segmented filter
- Button matrix and floating actions
- Primary Coral / Secondary Sage / Outline / Danger / Ghost controls
- Avatars and trust badges
- Booking status chips
- Pet showcase
- Requested Service Tier
- GPS live-track / route indicator
- Photo update action
- Realtime emergency vet dispatch consent
- Available slot cards
- OTP / hand-off verification
- Scheduled service card
- Escrow amount / promo code
- Wallet transaction rows
- New booking request
- Provider accept/decline actions
- Live dispatch stepper
- Service checklist
- Earnings summary
- KYC document preview
- Wallet / payment method cards
- Live chat messages
- Empty / fallback state

These examples should be implemented as real reusable components or composed from them, not as one-off screen markup.
