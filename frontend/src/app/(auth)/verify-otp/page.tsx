import * as React from 'react';
import { VerifyOtpForm } from '@/features/auth/components/VerifyOtpForm';

export default function VerifyOtpPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0b1c30] flex items-center justify-center text-white font-semibold">
          Đang tải giao diện...
        </div>
      }
    >
      <VerifyOtpForm />
    </React.Suspense>
  );
}
