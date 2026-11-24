import React from 'react';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '../hooks/useUnreadCount';

interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onClick, className = '' }) => {
  const { unreadCount, isCountLoading } = useUnreadCount();

  return (
    <button
      type="button"
      aria-label="Thông báo"
      className={`relative cursor-pointer flex items-center justify-center w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#08243D] transition-colors ${className}`}
      onClick={onClick}
    >
      <Bell className="w-5 h-5" />
      {!isCountLoading && unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};


