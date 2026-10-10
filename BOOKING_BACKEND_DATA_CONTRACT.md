# PET_LOVE – TỔNG HỢP BACKEND DATA CONTRACT CHO MOBILE BOOKING

**Mục đích:** Tài liệu này tổng hợp dữ liệu Backend thực tế đang trả/nhận cho các màn hình Mobile Booking còn thiếu. Dùng để làm căn cứ thiết kế giao diện (Stitch/Figma) bám sát 100% API/DTO/response hiện có, tránh phải sửa UI khi tích hợp.  
**Ngày lập:** 24/09/2026  
**Dự án:** PET_LOVE (Backend NestJS + Prisma)

---

## A. BOOKING STATE FLOW ĐANG DÙNG

### Flow chuyển trạng thái:
```
PENDING_PAYMENT
    ↓ (Khách thanh toán thành công & Tiền vào ký quỹ)
PENDING_PROVIDER_ACCEPTANCE
    ↓ (Provider Accept)
ACCEPTED
    ↓ (Provider Check-in)
IN_PROGRESS
    ↓ (Checklist + Evidence hoàn tất)
AWAITING_CUSTOMER_CONFIRMATION
    ↓ (Customer Confirm)
COMPLETED
    ↓
REVIEW (Đánh giá dịch vụ)
```

### A1. Enum BookingStatus thực tế trong backend (`backend/prisma/schema.prisma`):
```prisma
enum booking_status {
  PENDING_PAYMENT
  PENDING_PROVIDER_ACCEPTANCE
  ACCEPTED
  PROVIDER_ARRIVED
  CHECKED_IN
  IN_PROGRESS
  AWAITING_CUSTOMER_CONFIRMATION
  COMPLETED
  REJECTED
  PROVIDER_TIMEOUT
  CANCELLED
  EXPIRED
  DISPUTED
  INCIDENT_REPORTED
  RESOLVED
}
```

### A2. Có `booking_status_logs` / status history không?
- [x] Có
- [ ] Không
- [ ] Chưa rõ

**Response thực tế** (được trả trong `findBookingById`):
```json
"booking_status_logs": [
  {
    "id": "c1a2b3c4-0000-0000-0000-000000000001",
    "booking_id": "b1a2b3c4-0000-0000-0000-000000000001",
    "old_status": "ACCEPTED",
    "new_status": "IN_PROGRESS",
    "changed_by": "u1a2b3c4-0000-0000-0000-000000000001",
    "note": "Đối tác đã có mặt và bắt đầu thực hiện dịch vụ.",
    "created_at": "2026-09-24T10:00:00.000Z"
  }
]
```

### A3. Các timestamp booking thực tế đang có (Bảng `bookings`):
- `created_at`: Thời điểm tạo đơn (DateTime)
- `updated_at`: Thời điểm cập nhật cuối (DateTime)
- `accepted_at`: Thời điểm đối tác chấp nhận đơn (DateTime?)
- `started_at`: Thời điểm đối tác check-in bắt đầu làm (DateTime?)
- `completion_requested_at`: Thời điểm đối tác bấm hoàn tất chờ nghiệm thu (DateTime?)
- `customer_confirmed_at`: Thời điểm khách bấm xác nhận hoàn tất (DateTime?)
- `completed_at`: Thời điểm đơn kết thúc (DateTime?)
- `cancelled_at`: Thời điểm đơn bị hủy (DateTime?)

---

## B. SCREEN 1 – PROVIDER BOOKING LIST
**Tên dự kiến:** `ProviderBookingListScreen`

### Nhiệm vụ UI:
Hiển thị danh sách đơn của Provider theo trạng thái:
- Chờ tiếp nhận (`PENDING_PROVIDER_ACCEPTANCE`)
- Sắp tới (`ACCEPTED`)
- Đang làm (`IN_PROGRESS`)
- Lịch sử (`COMPLETED`, `CANCELLED`, `REJECTED`)

### B1. Endpoint thực tế:
* `GET /bookings`
*(Ghi chú: Backend tự trích xuất thông tin người dùng từ JWT Access Token. Nếu user có Role là `PROVIDER`, backend tự động lọc `where.provider_id = user.provider_profiles.id`, không cần truyền query `role`)*.

### B2. Query params thực tế (`GetBookingsDto`):
```typescript
class GetBookingsDto {
  page?: number;     // Mặc định: 1, min: 1
  limit?: number;    // Mặc định: 10, min: 1
  status?: booking_status; // Tùy chọn lọc theo enum booking_status
}
```

### B3. Response JSON thực tế của 1 booking item trong danh sách:
```json
{
  "id": "0dfb41ea-1b91-49b8-bc88-825ee0c96c42",
  "customer_id": "3bb6d6d2-34f7-4dc4-b778-e56598c17b35",
  "provider_id": "6aa2c3f8-6ee4-469b-8e1c-5bb5bb29497e",
  "address_id": "5f89e472-e6e7-49cf-8924-44dfd41f3910",
  "requested_slot_id": "c1f10000-0000-0000-0000-000000000001",
  "provider_working_slot_id": "f5195d85-1d42-4fec-88ea-00363ce23555",
  "requested_date": "2026-09-25T00:00:00.000Z",
  "service_duration_minutes": 60,
  "travel_duration_minutes": 15,
  "buffer_minutes": 0,
  "estimated_start_at": "2026-09-25T09:00:00.000Z",
  "estimated_end_at": "2026-09-25T10:00:00.000Z",
  "status": "PENDING_PROVIDER_ACCEPTANCE",
  "total_price": "250000.00",
  "customer_note": "Bé hơi nhát người lạ, xin làm nhẹ tay",
  "provider_note": null,
  "cancellation_reason": null,
  "created_at": "2026-09-24T08:00:00.000Z",
  "updated_at": "2026-09-24T08:05:00.000Z",
  "customer_addresses": {
    "id": "5f89e472-e6e7-49cf-8924-44dfd41f3910",
    "customer_id": "3bb6d6d2-34f7-4dc4-b778-e56598c17b35",
    "label": "Nhà riêng",
    "receiver_name": "Nguyễn Văn A",
    "phone": "0987654321",
    "address_line": "123 Đường Nguyễn Trãi",
    "ward": "Phường 2",
    "district": "Quận 5",
    "city": "Hồ Chí Minh",
    "latitude": "10.7553410",
    "longitude": "106.6789120",
    "formatted_address": "123 Đường Nguyễn Trãi, Phường 2, Quận 5, TP.HCM"
  },
  "users": {
    "id": "3bb6d6d2-34f7-4dc4-b778-e56598c17b35",
    "fullName": "Nguyễn Văn A",
    "avatarUrl": "https://example.com/avatar.jpg",
    "phone": "0987654321"
  },
  "booking_pets": [
    {
      "id": "11111111-2222-3333-4444-555555555555",
      "pet_id": "pet-01",
      "pet_name": "Milo",
      "species": "Dog",
      "breed": "Poodle",
      "weight": "4.50",
      "avatar_url": "https://example.com/milo.jpg",
      "pets": {
        "id": "pet-01",
        "name": "Milo",
        "species": "Dog",
        "breed": "Poodle",
        "weight": "4.50",
        "avatar_url": "https://example.com/milo.jpg"
      },
      "booking_services": [
        {
          "id": "srv-item-01",
          "service_name": "Tắm spa khử mùi",
          "price": "250000.00",
          "duration_minutes": 60,
          "provider_services": {
            "services": {
              "id": "srv-01",
              "name": "Tắm spa khử mùi",
              "duration_minutes": 60
            }
          }
        }
      ]
    }
  ]
}
```

### B4. Kiểm tra backend có trả các field sau không:
* **Booking:**
  - [x] `id`
  - [x] `status`
  - [x] `requestedDate` (`requested_date`)
  - [x] `estimatedStartAt` (`estimated_start_at`)
  - [x] `estimatedEndAt` (`estimated_end_at`)
  - [x] `totalPrice` (`total_price`)
  - [ ] `providerAmount` -> **CHƯA CÓ TRONG LIST** (chỉ có tổng tiền `total_price`)
  - [x] `createdAt` (`created_at`)
* **Customer:**
  - [x] `customer.id` (`users.id`)
  - [x] `customer.fullName` (`users.fullName`)
  - [x] `customer.phone` (`users.phone`)
  - [x] `customer.avatarUrl` (`users.avatarUrl`)
* **Pet:**
  - [x] `pet.id`
  - [x] `pet.name` (`pet_name` hoặc `pets.name`)
  - [x] `pet.species`
  - [x] `pet.breed`
  - [x] `pet.weight`
  - [x] `pet.avatarUrl` (`avatar_url`)
* **Service:**
  - [x] `service.id`
  - [x] `service.name` (`service_name`)
  - [x] `service.durationMinutes` (`duration_minutes`)
* **Address:**
  - [x] `address.addressLine` (`customer_addresses.address_line`)
  - [x] `address.ward` (`customer_addresses.ward`)
  - [x] `address.district` (`customer_addresses.district`)
  - [x] `address.city` (`customer_addresses.city`)
  - [ ] `address.estimatedDistanceKm` -> **CHƯA TÍNH TRONG LIST** (chỉ có toạ độ `latitude`, `longitude` và trong `price_snapshot`)

### B5. Pagination response:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## C. SCREEN 2 – PROVIDER BOOKING DETAIL / ACCEPT / REJECT / CANCEL
**Tên dự kiến:** `ProviderBookingActionDetailScreen`

### C1. GET booking detail endpoint:
* `GET /bookings/:id`

### C2. Response JSON thực tế:
Toàn bộ row của bảng `bookings` kèm các relations:
- `address_snapshot`: `{ receiverName, phone, addressLine, ward, district, city }`
- `price_snapshot`: `{ basePrice, servicePrice, travelFee, distanceKm, discountAmount, promoCode, finalPrice }`
- `booking_pets` (kèm `health_note`, `behavior_note`, `booking_services`)
- `booking_media`
- `booking_status_logs`
- `booking_events`

### C3. Kiểm tra field detail backend có trả:
* **Booking:**
  - [x] `id`, `status`, `requestedDate`, `estimatedStartAt`, `estimatedEndAt`, `customerNote`, `totalPrice`
* **Payment:**
  - [x] `payment.totalAmount` (`total_price`)
  - [x] `payment.travelFee` (`price_snapshot.travelFee`)
  - [x] `payment.discount` (`discount_amount`)
  - [ ] `payment.providerAmount` -> **CHƯA CÓ TRỰC TIẾP TRONG DTO NÀY** (UI có thể lấy `total_price - travelFee - platformFee` hoặc backend bổ sung relation `payments`)
* **Customer:**
  - [x] `customer.id`, `customer.fullName`, `customer.phone`, `customer.avatarUrl`
* **Pet:**
  - [x] `pet.id`, `pet.name`, `pet.avatarUrl`, `pet.species`, `pet.breed`, `pet.gender`, `pet.weight`
  - [x] `pet.healthNote` (`health_note` - ĐÃ CÓ)
  - [x] `pet.behaviorNote` (`behavior_note` - ĐÃ CÓ)
* **Address:**
  - [x] `address.addressLine`, `ward`, `district`, `city`
  - [x] `address.latitude`, `address.longitude`

### C4. ACCEPT API:
* **Endpoint:** `POST /bookings/:id/provider-accept`
* **HTTP Method:** `POST`
* **Request body DTO:** Không có body (`{}`)
* **Response thực tế:**
```json
{
  "bookingId": "0dfb41ea-1b91-49b8-bc88-825ee0c96c42",
  "status": "ACCEPTED"
}
```

### C5. REJECT API:
* **Endpoint:** `POST /bookings/:id/provider-reject`
* **HTTP Method:** `POST`
* **Có bắt nhập reason không?**
  - [ ] Có
  - [x] **Không**
* **Response thực tế:**
```json
{
  "bookingId": "0dfb41ea-1b91-49b8-bc88-825ee0c96c42",
  "status": "REJECTED"
}
```

### C6. PROVIDER CANCEL API:
* **Endpoint:** `POST /bookings/:id/provider-cancel`
* **HTTP Method:** `POST`
* **DTO thực tế (`ProviderCancelBookingDto`):**
```json
{
  "reason": "Xe bị thủng lốp không thể đến kịp",
  "note": "Đã gọi điện thoại xin lỗi khách hàng"
}
```
* Validation: `reason` (string, required), `note` (string, optional).
* Enum cancellation reason: **CHƯA CÓ ENUM** (dùng text tự do).

### C7. Chat / Call data:
* Chat room được tự động tạo/kích hoạt ngay khi Provider bấm **Accept**.
* Endpoint lấy phòng chat: `GET /api/chat/rooms` (tìm theo `booking_id`).
* Số điện thoại: [x] **Có** (Có trong `address_snapshot.phone` hoặc `users.phone`).

---

## D. SCREEN 3 – PROVIDER SERVICE EXECUTION
**Tên dự kiến:** `ProviderServiceExecutionScreen`

### D1. GPS CHECK-IN / START SERVICE
* **Endpoint:** `POST /bookings/:id/start-service`
* **HTTP Method:** `POST`
* **DTO thực tế (`StartServiceDto`):**
```typescript
{
  petConditionNote?: string;       // Ghi chú hiện trạng sức khỏe / tâm lý ban đầu
  evidenceMedias?: [              // Danh sách ảnh chụp lúc tiếp nhận (nếu có)
    {
      mediaUrl: string;           // URL ảnh (required)
      mediaType?: 'IMAGE' | 'VIDEO'; // Default: 'IMAGE'
      caption?: string;           // Chú thích ảnh
    }
  ]
}
```
* **Field do App lấy / Provider nhập:**
  - `latitude`, `longitude`: App lấy trên máy client nhưng **Backend không nhận 2 field này**.
  - `petConditionNote`: Provider nhập.
* **checkinPhoto:**
  - [ ] Gửi trực tiếp multipart
  - [x] **Upload trước rồi gửi URL** (Upload qua `/evidence-upload` lấy `mediaUrl` rồi truyền vào `evidenceMedias`)
* **Response thực tế:**
```json
{
  "bookingId": "0dfb41ea-1b91-49b8-bc88-825ee0c96c42",
  "status": "IN_PROGRESS",
  "message": "Dịch vụ đã bắt đầu thực hiện và lưu hiện trạng thú cưng thành công."
}
```
* **Backend có validate khoảng cách GPS không?**
  - [ ] Có
  - [x] **Không** (Client tự check GPS bằng Expo Location).

---

### D2. CHECKLIST
* **GET checklist endpoint:** `GET /bookings/:id/checklist`
* **Response checklist thực tế:**
```json
{
  "bookingId": "0dfb41ea-1b91-49b8-bc88-825ee0c96c42",
  "bookingStatus": "IN_PROGRESS",
  "totalItems": 4,
  "completedItems": 2,
  "skippedItems": 0,
  "pendingItems": 2,
  "progressPercentage": 50,
  "checklistItems": [
    {
      "id": "chk-01",
      "bookingServiceId": "srv-item-01",
      "serviceName": "Tắm spa khử mùi",
      "petName": "Milo",
      "templateId": "tpl-01",
      "title": "Kiểm tra sơ bộ da và lông",
      "status": "DONE",
      "note": null,
      "completedAt": "2026-09-24T10:15:00.000Z",
      "createdAt": "2026-09-24T08:00:00.000Z"
    }
  ],
  "evidenceMedias": []
}
```
* **Checklist item có các field:**
  - [x] `id`
  - [x] `title`
  - [x] `status`
  - [x] `completedAt` (`completed_at`)
  - [x] `note`
  - [x] `serviceName`, `petName`
* **Enum checklist status thực tế:** `PENDING`, `DONE`, `SKIPPED`.
* **Update 1 item endpoint:**
  - HTTP method: `PATCH`
  - Endpoint: `PATCH /bookings/:id/checklist/:itemId`
  - DTO:
  ```json
  {
    "status": "DONE",
    "note": "Đã hoàn thành bước tắm"
  }
  ```
* **Batch update endpoint:**
  - HTTP method: `PATCH`
  - Endpoint: `PATCH /bookings/:id/checklist/batch`
  - DTO:
  ```json
  {
    "items": [
      { "checklistItemId": "chk-01", "status": "DONE", "note": "" }
    ]
  }
  ```
* **Backend có rule bắt buộc 100% checklist trước complete không?**
  - [ ] Có
  - [x] **Không** (Chỉ validate logic ở phía UI Web/App).

---

### D3. EVIDENCE UPLOAD
* **Upload endpoint:** `POST /bookings/:id/evidence-upload`
* **HTTP Method:** `POST`
* **Kiểu upload:** `multipart/form-data`
* **Tên multipart field:** `'file'` (File ảnh chụp, max 10MB, định dạng: `png|jpeg|jpg|webp`).
* **Response sau upload:**
```json
{
  "success": true,
  "mediaUrl": "https://storage.supabase.co/bookings/xxx/evidence-123.jpg",
  "mediaType": "IMAGE",
  "fileName": "cat.jpg",
  "message": "Tải ảnh minh chứng lên thành công."
}
```
* **Enum media category thực tế:** **CHƯA CÓ CATEGORY**. Phân biệt thông qua trường `caption` khi hoàn tất.

---

### D4. COMPLETE SERVICE
* **Endpoint:** `POST /bookings/:id/complete`
* **HTTP Method:** `POST`
* **DTO thực tế (`CompleteBookingDto`):**
```json
{
  "checklistItems": [
    { "checklistItemId": "chk-01", "status": "DONE", "note": "" }
  ],
  "evidenceMedias": [
    {
      "mediaUrl": "https://storage.supabase.co/...",
      "mediaType": "IMAGE",
      "caption": "Ảnh hoàn tất dịch vụ"
    }
  ],
  "providerNote": "Bé rất ngoan và sạch sẽ."
}
```
* **Status sau complete:**
  - [x] `AWAITING_CUSTOMER_CONFIRMATION`
  - [ ] `COMPLETED`

---

## E. SCREEN 4 – PROVIDER SCHEDULE
**Tên dự kiến:** `ProviderScheduleScreen`

### E1. GET schedule endpoint:
* Endpoint: `GET /provider-schedules`
* Query params: `startDate=2026-09-21&endDate=2026-09-27`
* **Response thực tế:**
```json
[
  {
    "id": "day-01",
    "work_date": "2026-09-21",
    "working_mode": "FULL_TIME",
    "provider_working_slots": [
      {
        "id": "slot-work-01",
        "slot_id": "slot-01",
        "status": "AVAILABLE",
        "time_slots": { "start_time": "08:00", "end_time": "09:00" }
      }
    ]
  }
]
```

### E2. Enum slot status thực tế (`availability_slot_status`):
```prisma
enum availability_slot_status {
  AVAILABLE
  HELD_FOR_PAYMENT
  RESERVED_FOR_PROVIDER_RESPONSE
  BOOKED
  BLOCKED
  COMPLETED
}
```

### E3. Create / Update schedule:
* **Endpoint:** `POST /provider-schedules`
* **HTTP Method:** `POST`
* **DTO thực tế (`UpdateProviderScheduleDto`):**
```json
{
  "schedules": [
    {
      "workDate": "2026-09-25",
      "workingMode": "FULL_TIME",
      "slotIds": ["c1f10000-0000-0000-0000-000000000001", "c1f10000-0000-0000-0000-000000000002"]
    }
  ]
}
```

### E4. Block slot:
* **Endpoint:** `PUT /provider-schedules/slots/:slotId/block`
* **HTTP Method:** `PUT` (Không có body)

### E5. Unblock slot:
* **CHƯA CÓ ENDPOINT RIÊNG:** Để mở lại một slot, gọi `POST /provider-schedules` và truyền `slotId` vào mảng `slotIds`.

### E6. Copy week:
* **Endpoint:** `POST /provider-schedules/copy-week`
* **HTTP Method:** `POST`
* **DTO thực tế (`CopyWeekScheduleDto`):**
```json
{
  "sourceWeekStart": "2026-09-21",
  "targetWeekStart": "2026-09-28"
}
```
* **Backend xử lý conflict BOOKED khi copy week:** Backend tự động bảo vệ giữ nguyên trạng thái nếu slot ở tuần đích đã là `BOOKED`, `HELD_FOR_PAYMENT` hoặc `RESERVED_FOR_PROVIDER_RESPONSE` (không ghi đè).

---

## F. SCREEN 5 – CUSTOMER BOOKING DETAIL / TRACKING
**Tên dự kiến:** `CustomerBookingDetailScreen`

### F1. Endpoint detail Customer:
* `GET /bookings/:id` (Dùng chung endpoint với Provider, phân quyền tự động theo JWT).

### F2. Provider data có trả:
- [x] `provider_profiles.id`
- [x] `provider_profiles.users.fullName`
- [x] `provider_profiles.users.avatarUrl`
- [x] `provider_profiles.users.phone`
- [x] `provider_profiles.rating_avg`
- [x] `provider_profiles.total_reviews`
- [x] `provider_profiles.trust_score`

### F3. Pet + Service data:
- [x] `pet.id`, `pet.name`, `pet.avatarUrl`, `pet.breed`, `pet.species`, `pet.weight`
- [x] `service.id`, `service.name`, `service.durationMinutes`

### F4. Payment / Escrow data:
- [x] `servicePrice` (trong `price_snapshot.servicePrice`)
- [x] `travelFee` (trong `price_snapshot.travelFee`)
- [x] `discount` (trong `discount_amount`)
- [x] `totalAmount` (`total_price`)
- [ ] `escrowStatus` (Bảng `payments` không include trực tiếp, nhưng tiến trình thanh toán được ánh xạ qua `booking.status`)

### F5. Timeline / Status history:
- [x] Backend có trả `booking_status_logs` và danh sách các timestamp (`created_at`, `accepted_at`, `started_at`, `completion_requested_at`, `customer_confirmed_at`).

### F6. Media / Evidence:
- [x] Có trả `booking_media` gồm toàn bộ ảnh check-in và hoàn thành.

### F7. Customer Confirm Completion:
* **Endpoint:** `POST /bookings/:id/customer-confirm`
* **HTTP Method:** `POST` (Body rỗng)
* **Sau confirm backend có tự release escrow không?**
  - [x] **Có** (Hệ thống tự động chạy `releaseEscrow` trong cùng Database Transaction).

### F8. Customer Cancel Booking:
* **Endpoint:** `POST /bookings/:id/cancel`
* **HTTP Method:** `POST`
* **DTO thực tế:** Không nhận body (mặc định lý do `"Khách hàng tự hủy Booking"`).

---

## G. SCREEN 6 – CUSTOMER REVIEW
**Tên dự kiến:** `CustomerReviewScreen`

### G1. Create review endpoint:
* **Endpoint:** `POST /bookings/:id/reviews`
* **HTTP Method:** `POST`
* **DTO thực tế (`CreateReviewDto`):**
```json
{
  "rating": 5,
  "comment": "Dịch vụ rất tốt, bé nhà mình rất thích!"
}
```

### G2. Rating rule:
* Min: 1
* Max: 5 (Số nguyên, required)
* Comment: Optional, tối đa 1000 ký tự.

### G3. Review images:
- [ ] POST review bằng multipart
- [ ] Upload ảnh trước -> gửi URL
- [ ] Upload ảnh trước -> gửi media ID
- [x] **Chưa implement** (Bảng `review_media` có trong database nhưng `CreateReviewDto` chưa hỗ trợ nhận field ảnh).

### G4. Backend có chặn review trùng booking không?
- [x] **Có** (Báo lỗi 400: `"You have already reviewed this booking"`).

---

## H. SCREEN 7 – DISPUTE / COMPLAINT
**Tên dự kiến:** `DisputeComplaintScreen`

### H1. Dispute endpoint:
* **Endpoint:** `POST /bookings/:id/dispute`
* **HTTP Method:** `POST`
* **DTO thực tế (`OpenDisputeDto`):**
```json
{
  "reason": "BAD_SERVICE_QUALITY",
  "description": "Thợ đến trễ 1 tiếng và không làm đủ các bước vệ sinh tai cho bé."
}
```

### H2. Complaint/Dispute reason enum THỰC TẾ (`dispute_reason`):
```prisma
enum dispute_reason {
  SERVICE_NOT_COMPLETED
  BAD_SERVICE_QUALITY
  PROVIDER_NO_SHOW
  CUSTOMER_NO_SHOW
  PET_INJURY
  WRONG_ADDRESS
  OTHER
}
```

### H3. Validation:
* `reason`: enum `dispute_reason` (Bắt buộc).
* `description`: string, tối đa 2000 ký tự (Bắt buộc).

### H4. Enum dispute status (`complaint_status`):
```prisma
enum complaint_status {
  OPEN
  WAITING_FOR_EVIDENCE
  UNDER_REVIEW
  DECIDED
  RESOLVED
  REJECTED
  CLOSED
}
```

---

## I. ENUM / CONSTANT TỔNG HỢP CẦN DÙNG CHUNG

### I1. BookingStatus
`PENDING_PAYMENT`, `PENDING_PROVIDER_ACCEPTANCE`, `ACCEPTED`, `PROVIDER_ARRIVED`, `CHECKED_IN`, `IN_PROGRESS`, `AWAITING_CUSTOMER_CONFIRMATION`, `COMPLETED`, `REJECTED`, `PROVIDER_TIMEOUT`, `CANCELLED`, `EXPIRED`, `DISPUTED`, `INCIDENT_REPORTED`, `RESOLVED`.

### I2. ChecklistStatus
`PENDING`, `DONE`, `SKIPPED`.

### I3. MediaType
`IMAGE`, `VIDEO`.

### I4. MediaCategory
**CHƯA CÓ CATEGORY** (Dùng trường `caption` để phân biệt).

### I5. ComplaintReason
`SERVICE_NOT_COMPLETED`, `BAD_SERVICE_QUALITY`, `PROVIDER_NO_SHOW`, `CUSTOMER_NO_SHOW`, `PET_INJURY`, `WRONG_ADDRESS`, `OTHER`.

### I6. ComplaintStatus
`OPEN`, `WAITING_FOR_EVIDENCE`, `UNDER_REVIEW`, `DECIDED`, `RESOLVED`, `REJECTED`, `CLOSED`.

### I7. CancellationReason
Dùng chuỗi tự do `string` (Chưa có enum).

### I8. Provider availability / slot status
`AVAILABLE`, `HELD_FOR_PAYMENT`, `RESERVED_FOR_PROVIDER_RESPONSE`, `BOOKED`, `BLOCKED`, `COMPLETED`.

### I9. Role
`CUSTOMER`, `PROVIDER`, `ADMIN`.

---

## J. ERROR RESPONSE / EDGE CASES

### J1. Format lỗi chung backend:
```json
{
  "statusCode": 400,
  "message": "Thông báo lỗi chi tiết",
  "error": "Bad Request"
}
```

### J2. Các mã lỗi thường gặp:
* `400 Bad Request`: Lỗi validation DTO hoặc sai logic trạng thái (ví dụ đơn chưa hoàn thành mà gửi review).
* `401 Unauthorized`: Token hết hạn hoặc không hợp lệ.
* `403 Forbidden`: Truy cập đơn không thuộc quyền sở hữu của mình.
* `404 Not Found`: Không tìm thấy Booking ID / Slot ID.
* `409 Conflict`: Slot làm việc đã bị người khác đặt hoặc trùng lịch.

---

## K. AUTH / ROLE / PERMISSION
* Provider API & Customer API đều lấy user hiện tại thông qua **JWT Bearer Token** (`@GetCurrentUserId() userId: string`).
* Role: `CUSTOMER`, `PROVIDER`, `ADMIN`.

---

## L. REALTIME / REFRESH
* **Giao thức:** WebSocket (`Socket.IO`).
* **Namespace:** `/notifications`
* **Event:** `'notification:new'`
* **Payload nhận:**
```json
{
  "id": "notif-uuid",
  "userId": "user-uuid",
  "type": "BOOKING_ACCEPTED",
  "title": "Đơn đặt lịch đã được chấp nhận",
  "content": "Đối tác đã đồng ý nhận đơn...",
  "relatedBookingId": "booking-uuid",
  "actionUrl": "/customer/bookings/...",
  "createdAt": "2026-09-24T10:00:00.000Z"
}
```

---

## M. BẢNG CHECKLIST ĐÁNH GIÁ TRƯỚC KHI CHỐT UI

| STT | Câu hỏi kiểm tra Backend | Kết quả kiểm tra code thực tế |
| :---: | :--- | :--- |
| **1** | `ProviderBookingList` có trả `providerAmount` hay không? | **CHƯA CÓ**. Chỉ có `total_price` trong list. |
| **2** | `GET booking detail` có đủ `healthNote` + `behaviorNote`? | **CÓ**. Nằm trong `booking_pets.health_note` và `behavior_note`. |
| **3** | `Reject booking` có cần reason không? | **KHÔNG CẦN**. Gọi `POST /provider-reject` không cần body. |
| **4** | `Customer cancel DTO` chính xác là gì? | **BODY RỖNG**. Controller không nhận body, mặc định lý do hệ thống. |
| **5** | Backend có `statusHistory` để render timeline không? | **CÓ**. Có `booking_status_logs` và các timestamp. |
| **6** | `booking_media` có category phân biệt CHECKIN / COMPLETION không? | **CHƯA CÓ CATEGORY**. Phân biệt bằng `caption`. |
| **7** | `Review image upload` đang dùng flow nào? | **CHƯA CÓ**. `CreateReviewDto` hiện chỉ có rating và comment. |
| **8** | `ComplaintReason` enum đầy đủ gồm những giá trị nào? | 7 giá trị: `SERVICE_NOT_COMPLETED`, `BAD_SERVICE_QUALITY`, `PROVIDER_NO_SHOW`, `CUSTOMER_NO_SHOW`, `PET_INJURY`, `WRONG_ADDRESS`, `OTHER`. |
| **9** | `ProviderSchedule DTO` chính xác gồm field gì? | `schedules: [{ workDate, workingMode, slotIds }]`. |
| **10** | `Complete service` bắt buộc checklist/evidence ở backend hay chỉ UI validate? | **CHỈ UI VALIDATE**. Backend không chặn nếu thiếu evidence. |
| **11** | `Customer confirm` có tự release escrow ngay trong transaction không? | **CÓ**. Tự động chạy `releaseEscrow` trong cùng transaction. |
| **12** | `Realtime booking update` hiện dùng polling hay socket? | **CẢ HAI**. Có WebSocket `/notifications` và hỗ trợ Polling/Pull-to-refresh. |
| **13** | Start Service GPS có validate bán kính toạ độ trên server không? | **KHÔNG**. Client mobile tự lấy GPS kiểm tra. |
| **14** | Có API Unblock slot riêng không? | **KHÔNG**. Phải gọi lại `POST /provider-schedules` để mở lại slot. |
