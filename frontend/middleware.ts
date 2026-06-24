import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Có thể thêm kiểm tra phân quyền & redirect ở đây trong tương lai
  return NextResponse.next();
}

// Cấu hình các route áp dụng middleware này
export const config = {
  matcher: [
    /*
     * Áp dụng cho tất cả các đường dẫn ngoại trừ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
