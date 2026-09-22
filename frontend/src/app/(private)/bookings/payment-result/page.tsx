'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePayment } from '@/features/booking/hooks/usePayment';
import { CheckCircle2, XCircle, Home, CalendarDays } from 'lucide-react';
import Link from 'next/link';

export default function PaymentResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyVNPayPayment } = usePayment();
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState<string>('Đang xác thực thanh toán...');

  React.useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      // Build the query string from search params
      const qs = searchParams.toString();
      if (!qs) {
        if (isMounted) {
          setStatus('error');
          setMessage('Không tìm thấy thông tin thanh toán.');
        }
        return;
      }

      try {
        // Axios interceptor tự động bóc tách vỏ { success, data, message } và chỉ trả về phần data.
        // Ngoài ra, nếu thanh toán thất bại, backend trả về HTTP 400 nên Axios sẽ quăng lỗi xuống catch.
        // Do đó, nếu code chạy được đến đây mà không bị nhảy xuống catch, tức là giao dịch THÀNH CÔNG (200 OK).
        const response = await verifyVNPayPayment(`?${qs}`);
        if (isMounted) {
          setStatus('success');
          setMessage('Thanh toán thành công! Đơn đặt lịch của bạn đã được ghi nhận.');
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setMessage(err?.response?.data?.message || err.message || 'Lỗi xác thực thanh toán.');
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-xl font-bold text-slate-800">Đang xử lý giao dịch</h2>
            <p className="text-slate-500 mt-2">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-slate-600 mb-8">{message}</p>
            
            <div className="w-full space-y-3">
              <Link 
                href="/bookings"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                <CalendarDays className="w-5 h-5" />
                Quản lý lịch đặt
              </Link>
              <Link 
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 p-4 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Giao dịch thất bại!</h2>
            <p className="text-slate-600 mb-8">{message}</p>
            
            <div className="w-full space-y-3">
              <Link 
                href="/bookings/new"
                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white p-4 rounded-xl font-bold hover:bg-slate-900 transition-colors"
              >
                Thử thanh toán lại
              </Link>
              <Link 
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 p-4 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                <Home className="w-5 h-5" />
                Về trang chủ
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
