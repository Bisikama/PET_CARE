import * as React from 'react';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0b1c30] flex items-center justify-center text-white font-semibold">
          Đang tải giao diện...
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
