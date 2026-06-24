# Cấu hình Gmail SMTP cho email OTP

## 1. Tạo Google App Password

1. Đăng nhập tài khoản Google sẽ dùng để gửi email.
2. Mở **Google Account > Security**.
3. Bật **2-Step Verification**. Google chỉ cho tạo App Password sau khi bật bước này.
4. Mở **App passwords** tại `https://myaccount.google.com/apppasswords`.
5. Đặt tên ứng dụng, ví dụ `Pet Care Backend`, rồi tạo mật khẩu.
6. Google trả về mật khẩu 16 ký tự. Dùng chuỗi này cho `MAIL_PASS`, không dùng mật khẩu Gmail thông thường.

## 2. Thêm biến vào `.env`

```env
APP_NAME="Pet Care"

MAIL_HOST="smtp.gmail.com"
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER="your-gmail@gmail.com"
MAIL_PASS="your-16-character-google-app-password"
MAIL_FROM="Pet Care <your-gmail@gmail.com>"

EMAIL_OTP_TTL_MINUTES=10
EMAIL_OTP_MAX_ATTEMPTS=5
MAIL_OTP_BACKGROUND_PATH=""
```

- Với port `465`, giữ `MAIL_SECURE=true`.
- Nếu dùng port `587`, đặt `MAIL_SECURE=false` để Nodemailer dùng STARTTLS.
- `MAIL_FROM` nên dùng cùng địa chỉ với `MAIL_USER`; Gmail có thể thay thế địa chỉ gửi nếu tài khoản chưa cấu hình alias.
- Có thể đặt `MAIL_OTP_BACKGROUND_PATH` thành đường dẫn tuyệt đối để dùng ảnh khác. Khi để trống, backend dùng `src/assets/email/pet-care-otp-background.png` và bản copy trong `dist`.

## 3. Chạy migration và backend

```bash
npx prisma migrate dev
npm run start:dev
```

Swagger UI: `http://localhost:3000/api-docs`

## 4. Kiểm tra luồng OTP

1. Gọi `POST /auth/register`. Backend tạo tài khoản và gửi email với tiêu đề **Xác thực mã OTP**.
2. Nếu cần gửi lại, gọi `POST /auth/send-email-otp` với body `{ "email": "..." }`.
3. Gọi `POST /auth/verify-email` với body `{ "email": "...", "otp": "123456" }`.
4. Sau khi xác thực thành công mới có thể gọi `POST /auth/login`.

## 5. Lỗi thường gặp

- `535 Username and Password not accepted`: kiểm tra `MAIL_USER`, bật xác minh hai bước và tạo lại App Password.
- Không thấy ảnh nền: kiểm tra client email có chặn ảnh hay không và đảm bảo file asset tồn tại trong `dist/assets/email` sau khi build.
- Email vào spam: dùng địa chỉ gửi ổn định, nội dung nhất quán; khi triển khai chính thức nên dùng domain riêng với SPF, DKIM và DMARC.
- Khi `NODE_ENV=production`, backend sẽ báo lỗi nếu thiếu cấu hình SMTP. Ở development, OTP được log ra console khi chưa cấu hình SMTP.
