# Tài Liệu Thiết Kế Cơ Sở Dữ Liệu Hệ Thống PetCare

Tài liệu này mô tả chi tiết kiến trúc cơ sở dữ liệu của nền tảng trung gian **PetCare** (mô hình Trust-first kết nối Khách hàng và Đối tác chăm sóc thú cưng). Hệ thống được thiết kế trên hệ quản trị cơ sở dữ liệu quan hệ (PostgreSQL) sử dụng định dạng khóa chính `UUID` để tăng tính bảo mật và mở rộng.

---

## I. Tổng Quan Hệ Thống & Các Nhóm Thực Thể

Cơ sở dữ liệu PetCare được chia làm 5 phân hệ lõi:

1. **Phân hệ Người dùng & Hồ sơ (Users & Profiles):** Quản lý tài khoản, địa chỉ khách hàng, hồ sơ chi tiết của thú cưng và đối tác (Provider).
2. **Phân hệ Dịch vụ & Lịch biểu (Services & Availability):** Quản lý danh mục dịch vụ chung, bảng giá riêng của từng đối tác và lịch làm việc lý thuyết.
3. **Phân hệ Đặt lịch & Vận hành (Bookings & Operations):** Trung tâm điều phối lịch trình, lưu vết trạng thái và cập nhật tiến trình (Checklist, Media).
4. **Phân hệ Tài chính & Giao tiếp (Financials & Communication):** Quản lý dòng tiền ký quỹ (Escrow), cổng thanh toán và phòng chat trực tuyến.
5. **Phân hệ Đánh giá & Giám sát (Trust & Quality Control):** Quản lý đánh giá hai chiều, khiếu nại/tranh chấp và hệ thống thông báo.

---

## II. Chi Tiết Các Thực Thể (Entities)

### 1. Nhóm Người dùng & Hồ sơ

#### Thực thể `users` (Người dùng)

Là thực thể gốc lưu trữ tài khoản của tất cả các bên tham gia hệ thống (`CUSTOMER`, `PROVIDER`, `ADMIN`).

- **id (UUID - PK):** Mã định danh duy nhất của người dùng.
- **email (VARCHAR - Unique):** Tài khoản đăng nhập.
- **password_hash (TEXT):** Mật khẩu đã được mã hóa an toàn.
- **role (ENUM):** Phân quyền hệ thống (`CUSTOMER`, `PROVIDER`, `ADMIN`).
- **is_active (BOOLEAN):** Trạng thái kích hoạt/khóa tài khoản.

#### Thực thể `customer_addresses` (Địa chỉ khách hàng)

Lưu các địa chỉ nhận dịch vụ tại nhà của khách hàng.

- **customer_id (UUID - FK):** Liên kết trực tiếp tới `users(id)`.
- **latitude / longitude (DECIMAL):** Tọa độ GPS phục vụ thuật toán tìm kiếm đối tác gần nhất.
- **is_default (BOOLEAN):** Đánh dấu địa chỉ mặc định khi đặt lịch.

#### Thực thể `pets` (Thú cưng)

Hồ sơ thú cưng thuộc sở hữu của khách hàng.

- **customer_id (UUID - FK):** Chủ sở hữu, liên kết tới `users(id)`.
- **name, species, breed, weight:** Thông tin cơ bản giúp Provider chuẩn bị dụng cụ phù hợp.

#### Thực thể `provider_profiles` (Hồ sơ Đối tác)

Chứa thông tin chuyên môn, trạng thái kiểm duyệt của đối tác sau khi đăng ký.

- **user_id (UUID - FK - Unique):** Liên kết 1:1 với thực thể `users(id)` (với điều kiện user có role là `PROVIDER`).
- **status (ENUM):** Trạng thái kiểm duyệt (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`).
- **rating_avg / total_reviews:** Các trường dữ liệu phái sinh (bán cấu trúc) dùng để tối ưu tốc độ hiển thị điểm uy tín.

---

### 2. Nhóm Dịch vụ & Lịch biểu

#### Thực thể `services` (Danh mục Dịch vụ)

Bảng danh mục dịch vụ gốc do Admin quản lý (Ví dụ: Tắm cắt lông, Tiêm vắc-xin tại nhà, Trông giữ hộ...).

- **base_price (DECIMAL):** Giá sàn tham chiếu.

#### Thực thể `provider_services` (Dịch vụ Đối tác cung cấp)

Bảng trung gian thể hiện một Đối tác nhận làm những dịch vụ nào và mức giá tùy chỉnh của họ là bao nhiêu.

- **provider_id (UUID - FK) & service_id (UUID - FK):** Khóa trùng lặp (`UNIQUE(provider_id, service_id)`).
- **price (DECIMAL):** Giá thực tế khách hàng phải trả khi book đối tác này.

#### Thực thể `provider_availability` (Lịch làm việc của Đối tác)

Quản lý các ca làm việc tuần hoàn của đối tác trong tuần.

- **day_of_week (SMALLINT):** Nhận giá trị từ 0 (Chủ nhật) đến 6 (Thứ bảy).
- **start_time / end_time (TIME):** Khung giờ sẵn sàng nhận việc.

---

### 3. Nhóm Đặt lịch & Vận hành

#### Thực thể `bookings` (Đơn đặt lịch)

Thực thể trung tâm kết nối toàn bộ luồng nghiệp vụ.

- **customer_id (UUID - FK):** Người đặt (Liên kết `users`).
- **provider_id (UUID - FK):** Người nhận việc (Liên kết `provider_profiles`).
- **provider_service_id (UUID - FK):** Gói dịch vụ được chọn (Chốt giá cố định, tránh lỗi sai lệch giá khi đối tác đổi cấu hình sau này).
- **status (ENUM):** Vòng đời đơn hàng (`PENDING` -> `ACCEPTED` -> `CONFIRMED` -> `PAID` -> `IN_PROGRESS` -> `COMPLETED`).

#### Thực thể `booking_status_logs` (Lịch sử trạng thái đơn)

Lưu lại dòng thời gian chuyển trạng thái của đơn hàng để làm bằng chứng đối soát, minh bạch.

#### Thực thể `service_checklist_templates` & `booking_checklist_items`

- **Templates:** Các bước bắt buộc của một dịch vụ do Admin định nghĩa.
- **Booking Items:** Khi một đơn hàng được tạo, hệ thống nhân bản template thành các đầu việc cụ thể để Provider tích chọn (`PENDING`, `DONE`, `SKIPPED`) và chụp ảnh báo cáo real-time.

#### Thực thể `booking_media` (Hình ảnh/Video tiến trình)

Nơi lưu giữ các tệp đa phương tiện do Provider tải lên trong lúc làm việc để Khách hàng theo dõi từ xa.

---

### 4. Nhóm Tài chính, Giao tiếp & Giám sát

#### Thực thể `payments` (Ký quỹ & Thanh toán)

- **status (ENUM):** Có trạng thái `HELD` (Sàn đang giữ tiền ký quỹ của khách) và `RELEASED` (Hệ thống đã chuyển tiền cho Provider sau khi hoàn thành dịch vụ).

#### Thực thể `chat_rooms` & `chat_messages`

Tạo phòng chat động gắn liền với `booking_id`. Phòng chat chỉ kích hoạt khi trạng thái booking hợp lệ và đóng lại khi dịch vụ kết thúc hoặc quá hạn.

#### Thực thể `reviews` (Đánh giá)

Lưu vết đánh giá 2 chiều: Khách hàng đánh giá chất lượng Provider, hoặc Provider đánh giá hành vi của Thú cưng/Khách hàng.

#### Thực thể `complaints` & `complaint_evidences` (Tranh chấp & Bằng chứng)

Khi phát sinh sự cố, bên bị hại tạo khiếu nại. Admin sẽ vào cuộc, dựa vào các tệp tin tại `complaint_evidences` cộng với `booking_status_logs` để đưa ra phán quyết hoàn tiền hay giải ngân.

---

## III. Sơ Đồ Mối Quan Hệ Giữa Các Thực Thể (Entity Relationship)

Dưới đây là các mối quan hệ liên kết logic cốt lõi giữa các bảng trong hệ thống:

### 1. Quan hệ 1 - Nhiều (One-to-Many)

- **`users` -> `customer_addresses` (1:N):** Một khách hàng có thể lưu nhiều địa chỉ nhà (Nhà riêng, cơ quan, nhà người thân).
- **`users` -> `pets` (1:N):** Một khách hàng có thể nuôi và tạo hồ sơ cho nhiều thú cưng.
- **`users` -> `bookings` (1:N):** Một người dùng có thể thực hiện nhiều lượt đặt lịch với tư cách là Khách hàng.
- **`provider_profiles` -> `bookings` (1:N):** Một đối tác có thể nhận và xử lý nhiều đơn đặt lịch trong đời mục.
- **`bookings` -> `booking_status_logs` (1:N):** Một đơn đặt lịch có nhiều mốc thời gian thay đổi trạng thái.
- **`bookings` -> `booking_checklist_items` (1:N):** Một đơn đặt lịch có một danh sách kiểm tra gồm nhiều đầu việc nhỏ cần hoàn thành.
- **`bookings` -> `booking_media` (1:N):** Khách hàng có thể nhận được nhiều hình ảnh/video cập nhật trong suốt ca làm việc.
- **`complaints` -> `complaint_evidences` (1:N):** Một vụ khiếu nại tranh chấp có thể đi kèm nhiều hình ảnh, video bằng chứng chứng minh từ các bên.

### 2. Quan hệ 1 - 1 (One-to-One)

- **`users` <-> `provider_profiles` (1:1):** Một tài khoản người dùng chỉ có thể mở tối đa một hồ sơ Đối tác (Provider). Khóa ngoại `user_id` trong bảng hồ sơ được đặt thuộc tính `UNIQUE`.
- **`bookings` <-> `payments` (1:1):** Mỗi một đơn đặt lịch dịch vụ chỉ gắn liền với duy nhất một giao dịch tài chính ký quỹ. Trường `booking_id` trong bảng `payments` là `UNIQUE`.
- **`bookings` <-> `chat_rooms` (1:1):** Mỗi một lượt đặt lịch phát sinh sẽ mở ra duy nhất một phòng giao tiếp riêng biệt giữa khách và đối tác đó. Trường `booking_id` trong bảng `chat_rooms` là `UNIQUE`.

### 3. Quan hệ Nhiều - Nhiều (Many-to-Many)

- **`provider_profiles` <-> `services` thông qua bảng trung gian `provider_services`:** \* Một Đối tác có thể cung cấp nhiều dịch vụ khác nhau.
  - Một dịch vụ hệ thống có thể được cung cấp bởi nhiều Đối tác với các mức giá cạnh tranh khác nhau.

---

## IV. Quy Tắc Ràng Buộc Hệ Thống (Business Rules & Integrity Constraints)

1. **Xóa tầng (Cascading Delete):** Khi một tài khoản `users` bị xóa, toàn bộ địa chỉ (`customer_addresses`), hồ sơ thú cưng (`pets`) và hồ sơ đối tác (`provider_profiles`) của họ sẽ tự động bị xóa theo (`ON DELETE CASCADE`) để tránh rác dữ liệu.
2. **Bảo vệ Đơn hàng (Restrict / Set Null):** Các dữ liệu liên quan đến tiền bạc và lịch sử như `bookings` không được phép xóa bừa bãi. Khi xóa một danh mục dịch vụ mẫu, các checklist đang chạy sẽ thiết lập khóa ngoại về `ON DELETE SET NULL` để không làm hỏng luồng dữ liệu lịch sử của khách hàng.
3. **Chống trùng lặp (Unique Constraints):**
   - Mỗi cặp `(provider_id, service_id)` trong bảng `provider_services` là duy nhất.
   - Mỗi bộ ba `(booking_id, reviewer_id, reviewee_id)` trong bảng `reviews` là duy nhất để đảm bảo một người không thể đánh giá hai lần cho cùng một đơn hàng.
