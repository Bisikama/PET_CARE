import * as React from 'react';
import { useServices } from '../hooks/useServices';
import { ServiceCard } from './ServiceCard';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export const ServiceList: React.FC = () => {
  const { services, isLoading, error, refreshServices, clearError } = useServices();

  const handleRetry = () => {
    clearError();
    refreshServices();
  };

  // 1. Trạng thái lỗi (Error State)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-rose-50/50 rounded-[32px] border border-rose-100 max-w-2xl mx-auto my-12 text-center space-y-4">
        <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">Không thể tải dịch vụ</h3>
          <p className="text-sm text-slate-500 max-w-md">{error}</p>
        </div>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-colors duration-150 active:scale-95 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
      </div>
    );
  }

  // 2. Trạng thái đang tải (Loading Skeleton State)
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Header */}
        <div className="space-y-2.5">
          <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 animate-pulse rounded-lg" />
        </div>
        
        {/* Skeleton Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-[24px] border border-slate-100 p-6 space-y-5 flex flex-col"
            >
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 bg-slate-200 animate-pulse rounded-2xl" />
                <div className="h-6 w-28 bg-slate-200 animate-pulse rounded-full" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-5 w-2/3 bg-slate-200 animate-pulse rounded-lg" />
                <div className="h-4 w-full bg-slate-200 animate-pulse rounded-lg" />
                <div className="h-4 w-5/6 bg-slate-200 animate-pulse rounded-lg" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="h-4 w-28 bg-slate-200 animate-pulse rounded-lg" />
                <div className="h-4 w-16 bg-slate-200 animate-pulse rounded-lg" />
              </div>
              <div className="h-10 w-full bg-slate-200 animate-pulse rounded-xl pt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Trạng thái danh sách rỗng (Empty State)
  if (!services || services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[32px] border border-slate-100 shadow-sm max-w-2xl mx-auto my-12 text-center space-y-6">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-teal-500/10 blur animate-pulse" />
          <div className="relative p-5 bg-teal-50 text-teal-600 rounded-2xl border border-teal-100">
            <Sparkles className="h-10 w-10 fill-teal-100/30" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-800">Chưa có dịch vụ nào hoạt động</h3>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            Hệ thống hiện tại chưa có gói dịch vụ thú cưng nào được kích hoạt. Hãy quay lại sau khi quản trị viên cập nhật danh sách dịch vụ.
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold transition-colors duration-150 active:scale-95 cursor-pointer shadow-md shadow-teal-500/10"
        >
          <RefreshCw className="h-4 w-4" />
          Kiểm tra lại hệ thống
        </button>
      </div>
    );
  }

  // 4. Trạng thái có dữ liệu hiển thị (Render Grid of Services)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dịch vụ thú cưng của hệ thống</h2>
        <p className="text-sm text-slate-400 mt-1">
          Dưới đây là danh sách các gói dịch vụ chăm sóc và làm đẹp chất lượng cao đang được cung cấp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
};
