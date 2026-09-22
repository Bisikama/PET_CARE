import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkAllRead } from '../hooks/useMarkAllRead';
import { useMarkRead } from '../hooks/useMarkRead';
import { Check, CheckCircle2 } from 'lucide-react';

interface NotificationListProps {
  className?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({ className = '' }) => {
  const { notifications, isLoading, error } = useNotifications();
  const { markAllAsRead } = useMarkAllRead();
  const { markAsRead } = useMarkRead();

  if (isLoading) {
    return <div className={`p-4 text-center text-sm text-gray-500 ${className}`}>Đang tải thông báo...</div>;
  }

  if (error) {
    return <div className={`p-4 text-center text-sm text-red-500 ${className}`}>{error}</div>;
  }

  if (notifications.length === 0) {
    return <div className={`p-4 text-center text-sm text-gray-500 ${className}`}>Không có thông báo nào</div>;
  }

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className={`flex flex-col bg-white rounded-md shadow-lg border overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-800">Thông báo</h3>
        {hasUnread && (
          <button 
            onClick={() => markAllAsRead()}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <CheckCircle2 size={14} />
            Đánh dấu đã đọc tất cả
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto max-h-96">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-4 border-b last:border-b-0 transition-colors cursor-pointer hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
            onClick={() => !notification.isRead && markAsRead(notification.id)}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                <span className="text-xs text-gray-400 mt-2 block">
                  {new Date(notification.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              {!notification.isRead && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-100 transition-colors"
                  title="Đánh dấu đã đọc"
                >
                  <Check size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
