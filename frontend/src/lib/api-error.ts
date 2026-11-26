import { isAxiosError } from 'axios';

const ERROR_CODE_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
  ACCOUNT_ALREADY_EXISTS: 'Email này đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc sử dụng email khác.',
  EMAIL_CONFIRMATION_PENDING: 'Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư để nhập mã OTP.',
  EMAIL_NOT_VERIFIED: 'Email chưa được xác thực. Vui lòng xác thực email trước khi tiếp tục.',
  AUTH_OTP_INVALID_OR_EXPIRED: 'Mã OTP không chính xác hoặc đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.',
  ACCOUNT_LOCKED: 'Tài khoản của bạn hiện đang bị khóa. Vui lòng liên hệ bộ phận hỗ trợ.',
  ACCOUNT_LOCKED_OR_MISSING: 'Tài khoản không tồn tại hoặc đang bị khóa.',
  AUTH_LOCAL_PROFILE_CREATE_FAILED: 'Không thể khởi tạo hồ sơ tài khoản. Vui lòng thử lại sau.',
  GOOGLE_ID_TOKEN_INVALID: 'Phiên đăng nhập Google không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.',
  AUTH_PROVIDER_UNAVAILABLE: 'Dịch vụ xác thực đang tạm gián đoạn. Vui lòng thử lại sau ít phút.',
  'Invalid Supabase access token': 'Phiên xác thực không hợp lệ. Vui lòng đăng nhập lại.',
  ACCOUNT_IDENTITY_CONFLICT: 'Thông tin tài khoản bị xung đột. Vui lòng liên hệ bộ phận hỗ trợ.',
  ACCOUNT_AUTH_SETUP_INCOMPLETE: 'Tài khoản chưa hoàn tất thiết lập đăng nhập. Vui lòng thử lại.',
  LEGACY_ACCOUNT_LINK_REQUIRED: 'Tài khoản cần được liên kết lại. Vui lòng liên hệ bộ phận hỗ trợ.',
  AUTH_USER_CONTEXT_INVALID: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  AUTH_ACCESS_DENIED: 'Bạn không có quyền thực hiện thao tác này.',
  AUTH_PROFILE_OUT_OF_SYNC: 'Dữ liệu tài khoản đang chưa đồng bộ. Vui lòng thử lại sau.',
  AUTH_PASSWORD_CONFIRMATION_MISMATCH: 'Mật khẩu xác nhận không khớp với mật khẩu mới.',
  USER_NOT_FOUND: 'Không tìm thấy thông tin người dùng.',
  'User not found': 'Không tìm thấy thông tin người dùng.',
  'Booking not found': 'Không tìm thấy thông tin đơn đặt lịch.',
  'User with this email already exists': 'Email này đã tồn tại trong hệ thống.',
  Unauthorized: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.',
  Forbidden: 'Bạn không có quyền thực hiện thao tác này.',
  'Forbidden resource': 'Bạn không có quyền truy cập tài nguyên này.',
  'Not Found': 'Không tìm thấy dữ liệu yêu cầu.',
  'Bad Request': 'Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra lại.',
  'Internal server error': 'Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau.',
  'Too Many Requests': 'Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.',
  'Network Error': 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.',
};

const ERROR_CODE_UPPER_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ERROR_CODE_MESSAGES).map(([k, v]) => [k.toUpperCase(), v]),
);

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại thông tin.',
  401: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  409: 'Dữ liệu bị xung đột hoặc đã tồn tại.',
  422: 'Dữ liệu gửi lên không đúng định dạng.',
  429: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.',
  500: 'Hệ thống đang gặp sự cố tạm thời. Vui lòng thử lại sau.',
  502: 'Máy chủ phản hồi không hợp lệ. Vui lòng thử lại sau.',
  503: 'Hệ thống đang bảo trì hoặc quá tải. Vui lòng thử lại sau.',
  504: 'Kết nối máy chủ quá hạn. Vui lòng thử lại sau.',
};

const MACHINE_CODE_REGEX = /^[A-Z][A-Z0-9_]{2,}$/;
const VIETNAMESE_CHAR_REGEX = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

export function extractRawErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const errObj = error as { errorCode?: unknown; response?: { data?: { errorCode?: unknown; message?: unknown } } };
  if (typeof errObj.errorCode === 'string' && MACHINE_CODE_REGEX.test(errObj.errorCode)) {
    return errObj.errorCode;
  }
  const dataCode = errObj.response?.data?.errorCode;
  if (typeof dataCode === 'string' && MACHINE_CODE_REGEX.test(dataCode)) {
    return dataCode;
  }
  const rawMessage = errObj.response?.data?.message;
  if (typeof rawMessage === 'string' && MACHINE_CODE_REGEX.test(rawMessage.trim())) {
    return rawMessage.trim();
  }
  return null;
}

function translateSingleEntry(entry: string): string | null {
  const trimmed = entry.trim();
  if (!trimmed || /^(null|undefined)$/i.test(trimmed)) return null;

  const direct = ERROR_CODE_MESSAGES[trimmed] ?? ERROR_CODE_UPPER_MAP[trimmed.toUpperCase()];
  if (direct) return direct;

  if (/timeout of \d+ms exceeded/i.test(trimmed)) {
    return 'Kết nối máy chủ quá thời gian chờ. Vui lòng thử lại.';
  }
  if (/network error|econnrefused|err_network/i.test(trimmed)) {
    return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.';
  }
  if (MACHINE_CODE_REGEX.test(trimmed) || /^Request failed with status code \d+/i.test(trimmed)) {
    return null;
  }

  // Keep messages that are already localized in Vietnamese; suppress raw untranslated English backend messages.
  if (VIETNAMESE_CHAR_REGEX.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function translateRawErrorMessage(raw: unknown, status?: number, fallback?: string): string {
  const items = Array.isArray(raw) ? raw : [raw];
  const translated = items
    .filter((entry): entry is string => typeof entry === 'string')
    .map(translateSingleEntry)
    .filter((entry): entry is string => Boolean(entry));

  if (translated.length > 0) {
    return Array.from(new Set(translated)).join('. ');
  }

  return (
    fallback ||
    (status !== undefined ? STATUS_FALLBACK_MESSAGES[status] : undefined) ||
    'Đã xảy ra lỗi. Vui lòng thử lại sau.'
  );
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const rawMessage: unknown = isAxiosError<{ message?: unknown }>(error)
    ? error.response?.data?.message ?? error.message
    : error instanceof Error
      ? error.message
      : undefined;

  return translateRawErrorMessage(rawMessage, status, fallback);
}
