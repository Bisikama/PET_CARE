export const API_ERROR_MESSAGES: Record<number | string, string> = {
  // Lỗi mạng, máy chủ
  0: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.',
  500: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  502: 'Máy chủ quá tải hoặc đang bảo trì.',
  503: 'Dịch vụ tạm thời không khả dụng.',

  // Lỗi xác thực (Auth)
  400: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  401: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện hành động này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',

  // Lỗi cụ thể từ Backend (Dựa theo thông điệp hoặc mã lỗi tùy chỉnh nếu có)
  'Unauthorized': 'Email hoặc mật khẩu không chính xác.',
  'Bad Request': 'Thông tin bạn nhập chưa chính xác hoặc bị thiếu.',
  'Conflict': 'Dữ liệu này đã tồn tại trên hệ thống.',
  'EMAIL_CONFIRMATION_PENDING': 'Tài khoản chưa được xác thực OTP.',
  'AUTH_OTP_INVALID_OR_EXPIRED': 'Mã OTP không hợp lệ hoặc đã hết hạn.',

  // Default fallback
  'DEFAULT': 'Đã có lỗi xảy ra. Vui lòng thử lại.',
};

/**
 * Hàm lấy câu thông báo lỗi tùy chỉnh cho Mobile dựa trên mã lỗi (HTTP status) 
 * hoặc thông điệp gốc từ Backend.
 */
export const getMappedErrorMessage = (status: number, originalMessage?: string | string[]): string => {
  // 1. Ưu tiên map theo string (Original message text) nếu Backend trả về dạng mảng string hoặc string
  if (originalMessage) {
    const msgToMap = Array.isArray(originalMessage) ? originalMessage[0] : originalMessage;
    
    // Nếu có map theo từ khóa chính xác
    if (API_ERROR_MESSAGES[msgToMap]) {
      return API_ERROR_MESSAGES[msgToMap];
    }
    
    // Hoặc kiểm tra xem có chứa từ khóa phổ biến không
    if (msgToMap.toLowerCase().includes('email') && msgToMap.toLowerCase().includes('exist')) {
      return 'Email này đã được đăng ký. Vui lòng sử dụng email khác.';
    }
    if (msgToMap.toLowerCase().includes('password') && msgToMap.toLowerCase().includes('incorrect')) {
      return 'Mật khẩu không chính xác.';
    }
    if (msgToMap.toLowerCase().includes('not found')) {
      return 'Không tìm thấy tài khoản của bạn.';
    }

    // Nếu không có mapping nào khớp, trả về chính message của Backend!
    return msgToMap;
  }

  // 2. Map theo HTTP Status Code
  if (API_ERROR_MESSAGES[status]) {
    return API_ERROR_MESSAGES[status];
  }

  // 3. Fallback
  return API_ERROR_MESSAGES['DEFAULT'];
};
