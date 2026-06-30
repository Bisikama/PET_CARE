// src/common/constants/success-messages.constant.ts

export const AUTH_MESSAGES = {
  REGISTER_SUCCESS_CHECK_EMAIL: 'Đăng ký thành công. Vui lòng kiểm tra Gmail để nhập mã OTP xác nhận.',
  REGISTER_CHECK_EMAIL: 'Nếu email hợp lệ, vui lòng kiểm tra Gmail để tiếp tục.',
    OTP_RESENT_SUCCESS: 'Nếu tài khoản cần xác nhận, mã OTP đã được gửi tới Gmail.',
    LOGIN_SUCCESS: 'Đăng nhập thành công.',
    LOGOUT_SUCCESS: 'Đăng xuất thành công.'
} as const;
