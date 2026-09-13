'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ArrowRight, Home } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import Link from 'next/link';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const status = searchParams.get('status');
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className={`p-8 text-center ${isSuccess ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div className="flex justify-center mb-6">
            {isSuccess ? (
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                <CheckCircle2 className="w-12 h-12 text-emerald-600 relative z-10" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-rose-600" />
              </div>
            )}
          </div>
          <h1 className={`text-2xl font-black mb-2 ${isSuccess ? 'text-emerald-800' : 'text-rose-800'}`}>
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>
          <p className={`text-sm font-medium ${isSuccess ? 'text-emerald-600/80' : 'text-rose-600/80'}`}>
            {isSuccess 
              ? 'Giao dịch của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.' 
              : 'Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng kiểm tra lại phương thức thanh toán và thử lại.'}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Mã giao dịch</span>
              <span className="text-sm font-bold text-slate-800">{orderId || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Phương thức</span>
              <span className="text-sm font-bold text-slate-800">{method || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-sm font-medium text-slate-500">Trạng thái</span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                isSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {isSuccess ? 'THÀNH CÔNG' : 'THẤT BẠI'}
              </span>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <Link 
              href={ROUTES.DASHBOARD}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#0a1128] hover:bg-slate-800 text-white rounded-2xl font-bold transition-all active:scale-[0.98]"
            >
              Về trang quản lý
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link 
              href={ROUTES.LANDING}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all active:scale-[0.98]"
            >
              <Home className="w-4 h-4" />
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-[#00a86b] rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}
