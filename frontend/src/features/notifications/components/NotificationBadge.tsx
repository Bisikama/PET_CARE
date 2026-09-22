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
    <div 
      className={`relative cursor-pointer flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`} 
      onClick={onClick}
    >
      <Bell className="w-6 h-6 text-gray-700" />
      {!isCountLoading && unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};
