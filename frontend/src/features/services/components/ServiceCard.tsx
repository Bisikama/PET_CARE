import * as React from 'react';
import { Service } from '../types';
import { Clock, Coins, Home, Scissors, Sparkles, Stethoscope } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  // Định dạng tiền tệ VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // Xác định icon và màu sắc chủ đề dựa theo category
  const getCategoryConfig = (category: string | null) => {
    const normCategory = (category || '').toUpperCase();
    switch (normCategory) {
      case 'SITTER':
        return {
          icon: Home,
          label: 'Chăm sóc tại nhà',
          colorClass: 'bg-teal-50 text-teal-600 border-teal-100/80',
          gradientBg: 'from-teal-500/5 to-teal-500/0',
          badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-200/50',
        };
      case 'GROOMER':
        return {
          icon: Scissors,
          label: 'Làm đẹp & Spa',
          colorClass: 'bg-amber-50 text-amber-600 border-amber-100/80',
          gradientBg: 'from-amber-500/5 to-amber-500/0',
          badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-200/50',
        };
      case 'VET':
        return {
          icon: Stethoscope,
          label: 'Y tế & Bác sĩ thú y',
          colorClass: 'bg-rose-50 text-rose-600 border-rose-100/80',
          gradientBg: 'from-rose-500/5 to-rose-500/0',
          badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200/50',
        };
      default:
        return {
          icon: Sparkles,
          label: service.category || 'Dịch vụ thú cưng',
          colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-100/80',
          gradientBg: 'from-indigo-500/5 to-indigo-500/0',
          badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50',
        };
    }
  };

  const config = getCategoryConfig(service.category);
  const IconComponent = config.icon;

  return (
    <div className="group relative bg-white rounded-[24px] border border-slate-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Background Gradient Accent on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradientBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

      {/* Card Header Content */}
      <div className="p-6 flex-1 flex flex-col space-y-4 relative z-10">
        <div className="flex items-start justify-between gap-4">
          {/* Category Icon */}
          <div className={`p-3.5 rounded-2xl border ${config.colorClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="h-6 w-6 stroke-[2]" />
          </div>
          
          {/* Category Badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeColor}`}>
            {config.label}
          </span>
        </div>

        {/* Title & Description */}
        <div className="space-y-2 flex-1">
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-600 transition-colors duration-200 line-clamp-1">
            {service.name}
          </h3>
          <p className="text-sm text-slate-400 font-normal leading-relaxed line-clamp-3">
            {service.description || 'Chưa có thông tin mô tả chi tiết cho dịch vụ này.'}
          </p>
        </div>

        {/* Stats (Price & Duration) */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-slate-500 text-xs font-medium gap-4">
          <div className="flex items-center gap-1.5">
            <Coins className="h-4 w-4 text-slate-400" />
            <span>
              Giá gốc từ:{' '}
              <strong className="text-sm font-bold text-slate-700">
                {formatPrice(service.basePrice)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>
              <strong className="text-slate-700">{service.durationMinutes}</strong> phút
            </span>
          </div>
        </div>
      </div>

      {/* Hover Action Strip */}
      <div className="px-6 pb-6 pt-0 mt-auto relative z-10">
        <button className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border border-slate-100 bg-slate-50 text-slate-600 hover:bg-teal-600 hover:text-white hover:border-transparent transition-all duration-200 active:scale-[0.98] cursor-pointer">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
};
