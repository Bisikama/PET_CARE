# Quy Định & Chuẩn Mực Phát Triển Ứng Dụng Mobile (PetCare Mobile)

Tài liệu này định nghĩa toàn bộ quy chuẩn, kiến trúc, hệ thống design system và quy tắc code cho dự án **PetCare Mobile** (React Native + Expo SDK 57 + TypeScript + Expo Router). Tất cả thành viên và AI Assistant phải tuân thủ nghiêm ngặt để đảm bảo code nhất quán, tốc độ phát triển cao và trải nghiệm người dùng đạt chuẩn cao cấp.

---

## 1. Kiến Trúc & Cấu Trúc Thư Mục (Clean Modular Architecture)

Dự án áp dụng mô hình **Feature-driven Clean Architecture** phân tách rõ ràng giữa Routing, Core UI, Features và Hạ tầng (Infrastructure):

```
mobile/
├── app/                              # EXPO ROUTER (Routing ONLY)
│   ├── (auth)/                       # Luồng xác thực (Login, Register, OTP, Forgot Password)
│   ├── (customer)/                   # Luồng dành cho Khách hàng (Home, Explore, Pets, Bookings, Profile)
│   ├── (provider)/                   # Luồng dành cho Đối tác / Sitter / Clinic
│   ├── _layout.tsx                   # Root Layout, Font Loader, Global Providers & Route Guards
│   └── index.tsx                     # Entry point & Initial Redirect
│
├── src/
│   ├── core/                         # HỆ THỐNG DÙNG CHUNG (Domain-agnostic)
│   │   ├── theme/                    # Design System Tokens (Colors, Typography, Spacing, Radius, Shadows)
│   │   ├── components/               # Atomic UI Components (Button, Input, Card, Badge, Screen, BottomSheet...)
│   │   ├── hooks/                    # Global Custom Hooks (useDebounce, useKeyboard, useTheme...)
│   │   └── utils/                    # Common Utilities (formatters, validators, date helpers)
│   │
│   ├── features/                     # MODULES CHỨC NĂNG THEO DOMAIN
│   │   ├── home/                     # Feature Trang Chủ
│   │   │   ├── components/           # Sub-components riêng cho Home (Greeting, Banner, CategoryGrid...)
│   │   │   ├── screens/              # Screen hoàn chỉnh (HomeScreen.tsx)
│   │   │   ├── api/                  # API calls dành riêng cho Home
│   │   │   ├── hooks/                # Custom hooks nội bộ feature
│   │   │   ├── types/                # Types/Interfaces nội bộ
│   │   │   └── index.ts              # Public API export của feature
│   │   ├── auth/                     # Feature Xác thực & Tài khoản
│   │   ├── explore/                  # Feature Tìm kiếm & Khám phá dịch vụ
│   │   ├── bookings/                 # Feature Đặt lịch & Quản lý lịch hẹn
│   │   ├── pets/                     # Feature Quản lý Thú cưng
│   │   ├── providers/                # Feature Chi tiết & Hồ sơ Chuyên viên/Spa
│   │   ├── chat/                     # Feature Tin nhắn & Trò chuyện Realtime
│   │   ├── notifications/            # Feature Thông báo
│   │   └── wallet/                   # Feature Ví & Thanh toán
│   │
│   └── infrastructure/               # DỊCH VỤ HẠ TẦNG & TÍCH HỢP HỆ THỐNG
│       ├── api/                      # Axios HTTP Client, Interceptors, Token Refresh Queue
│       ├── storage/                  # SecureStore / AsyncStorage Wrapper
│       ├── location/                 # Geolocation & Map services
│       ├── notifications/            # Expo Push Notification Service
│       └── realtime/                 # WebSocket / Socket.io client
│
└── design/stitch/                    # MẪU THIẾT KẾ & ASSETS GỐC (Stitch Design System)
```

### Quy tắc phân chia file:
1. **`app/` chỉ làm nhiệm vụ Routing**:
   - Không viết logic nghiệp vụ phức tạp, không nhét hàng trăm dòng JSX vào các file trong `app/`.
   - Các file trong `app/` chỉ import Screen component từ `src/features/.../screens/` và export ra.
2. **`src/core/` không chứa logic nghiệp vụ domain**:
   - `Button`, `Input`, `Screen`, `Card` trong `src/core/components` phải tái sử dụng được ở mọi nơi, không phụ thuộc vào `petId`, `bookingId`, hay logic của bất kỳ feature nào.
3. **Mỗi Feature là một module độc lập**:
   - Mọi type, sub-component, api request và hook chỉ phục vụ riêng cho Feature đó phải nằm trong `src/features/<feature_name>/`.

---

## 2. Quy Chuẩn Design System (Stitch Modern Pet Care)

Thiết kế của PetCare hướng tới phong cách **Modern Tactile Minimalism** – sang trọng, đáng tin cậy, ấm áp và cao cấp.

### 2.1 Bảng Màu (Color Tokens)
Sử dụng bộ token được định nghĩa trong `src/core/theme/colors.ts`:
- **Primary (`#00152D` / `#0B2A4A` - Deep Nautical Navy)**: Màu chủ đạo của thương hiệu, dùng cho header, tiêu đề chính, primary CTA, badges trang trọng. Thể hiện sự an toàn, bảo chứng chuyên nghiệp.
- **Secondary / Accent (`#F5B82E` / `#FDBF35` - Warm Golden Sun)**: Điểm nhấn ấm áp, dùng cho CTA quan trọng, ngôi sao đánh giá (ratings), huy hiệu khuyến mãi, tag nổi bật. Luôn kết hợp với chữ Navy đậm (`#0B2A4A`) để đạt độ tương phản tối đa.
- **Tertiary / Success (`#10B981` / `#00A472` - Emerald Sanctuary)**: Màu xanh ngọc biểu thị lịch hẹn đã xác nhận, huy hiệu đã kiểm định (Verified), trạng thái hoạt động.
- **Error / Destructive (`#EF4444` / `#BA1A1A` - Soft Coral Red)**: Xử lý cảnh báo, nút hủy, trạng thái lỗi nhẹ nhàng nhưng rõ ràng.
- **Surface & Backgrounds**:
  - Base Background: `#F8F9FF` hoặc `#F4F7FA` (mát mẻ, sạch sẽ).
  - Surface Containers: `#FFFFFF` (Card trắng nổi), `#EFF4FF` (Surface Low), `#E5EEFF` (Surface Mid), `#DCE9FF` (Surface High).
- **Text Neutrals**:
  - Text Primary: `#0B1C30` / `#0F172A` (Đậm nét, dễ đọc).
  - Text Secondary / Variant: `#43474E` / `#64748B` (Mô tả phụ, nhãn).
  - Text Muted / Disabled: `#94A3B8` / `#C4C6CF` (Placeholder, viền phụ).

### 2.2 Typography (Plus Jakarta Sans)
- Toàn bộ typography sử dụng font family **Plus Jakarta Sans** với 4 weight chính: `Regular (400)`, `Medium (500)`, `SemiBold (600)`, `Bold (700)`.
- Luôn sử dụng typography tokens từ `src/core/theme/typography.ts`:
  - `typography.display`: 32px, Bold, Line height 40
  - `typography.h1`: 28px, Bold, Line height 36
  - `typography.h2`: 24px, SemiBold, Line height 32
  - `typography.h3`: 20px, SemiBold, Line height 28
  - `typography.h4`: 18px, SemiBold, Line height 24
  - `typography.bodyLg`: 16px, Regular / Medium, Line height 24
  - `typography.bodyMd`: 14px, Regular / Medium, Line height 20
  - `typography.bodySm`: 13px, Regular, Line height 18
  - `typography.label`: 11px - 13px, SemiBold / Bold, Letter spacing tinh chỉnh

### 2.3 Radius & Shadows (Bo góc & Đổ bóng)
- **Radius**: `sm (8px)`, `md (12px)`, `lg (16px - Standard Cards)`, `xl (24px - Bottom Sheet / Hero Cards)`, `full (9999px - Pills, Badges, Avatar)`.
- **Shadows**: Mềm mại, không dùng màu đen gắt (`#000000 50%`), luôn dùng độ mờ nhạt từ 4% đến 8% với tông navy `#0B2A4A`.

---

## 3. Quy Tắc Code & Lập Trình (Coding Standards)

### 3.1 Quy tắc TypeScript & Naming Conventions
1. **Không dùng `any` bừa bãi**: Định nghĩa interface / type rõ ràng cho Props, API DTOs, State.
2. **File & Folder Naming**:
   - React Components & Screens: `PascalCase.tsx` (VD: `HomeScreen.tsx`, `UpcomingAppointmentCard.tsx`).
   - Hooks: `camelCase.ts` với tiền tố `use` (VD: `useHomeData.ts`, `useAuth.ts`).
   - Utilities & APIs: `camelCase.ts` (VD: `homeApi.ts`, `dateFormatter.ts`).
   - Types: `*.types.ts` (VD: `home.types.ts`, `auth.types.ts`).
3. **Import Alias**: Luôn sử dụng path alias `@/` thay vì relative path lồng nhau quá sâu (`../../../`).
   - `@/core/...`
   - `@/features/...`
   - `@/infrastructure/...`

### 3.2 Quy tắc viết Component & Styling
1. **Sử dụng `StyleSheet.create`**:
   - Khai báo styles ở cuối file component.
   - Sử dụng các giá trị từ `theme.colors`, `theme.typography`, `theme.spacing`, `theme.radius`, `theme.shadows`.
   - **Tuyệt đối tránh**: Hardcode mã màu ngẫu nhiên (như `#e53935`, `#222`) trực tiếp trong inline styles khi đã có sẵn token trong theme.
2. **Chia nhỏ Component (Component Decomposition)**:
   - Một màn hình không được trở thành monolithic file > 350 dòng. Hãy tách thành các sub-components trong folder `components/` của feature tương ứng.
3. **Xử lý Responsive & Safe Area**:
   - Sử dụng component `<Screen>` từ `@/core/components/Screen` để tự động xử lý Safe Area Insets của tai thỏ, Dynamic Island và thanh điều hướng dưới đáy.
4. **Icons**:
   - Sử dụng `lucide-react-native` hoặc `@/core/components/Icon` để đảm bảo icon đồng bộ, sắc nét trên cả iOS và Android.

### 3.3 Quy tắc Xử lý Data, API & State Management
1. **Gọi API qua hạ tầng chuẩn**:
   - Toàn bộ HTTP request phải thông qua `apiClient` (`@/infrastructure/api/client`).
   - Tự động hưởng lợi từ cơ chế refresh token và token queue khi gặp lỗi 401.
2. **Loading, Error & Empty States**:
   - Mọi màn hình tải dữ liệu đều phải có 3 trạng thái:
     - **Loading**: Hiển thị Skeleton hoặc Loading spinner mượt mà.
     - **Error**: Hiển thị thông báo lỗi thân thiện cùng nút Retry.
     - **Empty**: Hiển thị hình ảnh minh họa hoặc icon kèm lời gọi hành động (CTA) khi danh sách trống.
3. **Pull to Refresh**:
   - Các màn hình dạng danh sách hoặc Home luôn hỗ trợ `RefreshControl` để người dùng có thể vuốt làm mới dữ liệu.

---

## 4. Danh Sách Kiểm Tra Khi Tạo/Sửa Màn Hình (Screen Checklist)

Trước khi hoàn thành một màn hình, hãy kiểm tra:
- [ ] Màn hình được bọc bởi `<Screen>` hoặc xử lý an toàn `useSafeAreaInsets()`.
- [ ] Sử dụng đúng bảng màu Stitch (`#00152D`, `#F5B82E`, `#10B981`, `#F8F9FF`...).
- [ ] Font chữ dùng đúng `typography` của Plus Jakarta Sans.
- [ ] Mọi nút bấm (Button / Touchable) đều có phản hồi chạm (`active:scale` hoặc `activeOpacity={0.7}`).
- [ ] Có xử lý hiển thị khi mạng chậm hoặc dữ liệu rỗng.
- [ ] Export sạch sẽ qua `index.ts` của feature.
- [ ] Router file trong `app/` chỉ đóng vai trò kết nối, không ôm đồm logic.

---

*Tài liệu được thiết lập để làm kim chỉ nam xuyên suốt quá trình phát triển PetCare Mobile.*
