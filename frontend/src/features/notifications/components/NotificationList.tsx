'use client';

import React, { useState, useMemo } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkAllRead } from '../hooks/useMarkAllRead';
import { useMarkRead } from '../hooks/useMarkRead';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock,
  Crown,
  Wallet,
  Coins,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';

interface NotificationListProps {
  className?: string;
  onClose?: () => void;
}

function formatNotificationTime(rawDate?: any): string {
  if (!rawDate) return 'Vừa xong';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return 'Vừa xong';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) {
    const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `Hôm qua, ${timeStr}`;
  }
  if (diffDay < 7) return `${diffDay} ngày trước`;

  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

function getNotificationVisual(type?: string, title?: string) {
  const t = (type || '').toUpperCase();
  const lowerTitle = (title || '').toLowerCase();

  if (
    t.includes('PAYMENT') ||
    t.includes('WALLET') ||
    lowerTitle.includes('thanh toán') ||
    lowerTitle.includes('cọc') ||
    lowerTitle.includes('nạp tiền')
  ) {
    return {
      icon: <Wallet className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200/80',
    };
  }

  if (t.includes('REFUND') || lowerTitle.includes('hoàn')) {
    return {
      icon: <Coins className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200/80',
    };
  }

  if (
    lowerTitle.includes('hội viên') ||
    lowerTitle.includes('vip') ||
    lowerTitle.includes('gói')
  ) {
    return {
      icon: <Crown className="w-4 h-4 text-[#F7C948]" />,
      bg: 'bg-[#08243D] border-[#F7C948]/30',
    };
  }

  if (
    t === 'BOOKING_COMPLETED' ||
    lowerTitle.includes('hoàn tất') ||
    lowerTitle.includes('thành công')
  ) {
    return {
      icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200/80',
    };
  }

  if (t === 'SERVICE_STARTED' || lowerTitle.includes('bắt đầu')) {
    return {
      icon: <Clock className="w-4 h-4 text-teal-600" />,
      bg: 'bg-teal-50 border-teal-200/80',
    };
  }

  if (t === 'BOOKING_ACCEPTED' || lowerTitle.includes('chấp nhận')) {
    return {
      icon: <CalendarCheck className="w-4 h-4 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200/80',
    };
  }

  if (
    t.includes('COMPLAINT') ||
    lowerTitle.includes('khiếu nại') ||
    lowerTitle.includes('tranh chấp')
  ) {
    return {
      icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
      bg: 'bg-rose-50 border-rose-200/80',
    };
  }

  if (t === 'NEW_MESSAGE' || lowerTitle.includes('tin nhắn')) {
    return {
      icon: <MessageSquare className="w-4 h-4 text-sky-600" />,
      bg: 'bg-sky-50 border-sky-200/80',
    };
  }

  return {
    icon: <Bell className="w-4 h-4 text-[#08243D]" />,
    bg: 'bg-slate-100 border-slate-200/80',
  };
}

export const NotificationList: React.FC<NotificationListProps> = ({ className = '' }) => {
  const { notifications, isLoading, error } = useNotifications();
  const { markAllAsRead } = useMarkAllRead();
  const { markAsRead } = useMarkRead();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead && !n.is_read).length;
  }, [notifications]);

  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.isRead && !n.is_read);
    }
    return notifications;
  }, [notifications, filter]);

  if (isLoading) {
    return (
      <div className={`p-8 text-center bg-white rounded-3xl ${className}`}>
        <div className="w-6 h-6 border-2 border-slate-200 border-t-[#08243D] rounded-full animate-spin mx-auto mb-2.5" />
        <p className="text-xs font-semibold text-slate-500">Đang tải thông báo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 text-center bg-white rounded-3xl ${className}`}>
        <p className="text-xs font-semibold text-rose-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden ${className}`}>
      {/* Header Bar */}
      <div className="px-5 py-4 border-b border-slate-100 bg-linear-to-r from-slate-50/90 to-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="font-bold text-sm text-[#08243D]">Thông báo</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-[#08243D] text-[#F7C948] px-2 py-0.5 rounded-full shadow-2xs">
              {unreadCount} mới
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead()}
            className="text-[11px] font-bold text-slate-600 hover:text-[#08243D] flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#08243D]" />
            Đọc tất cả
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <div className="flex items-center px-4 py-2 border-b border-slate-100 bg-white gap-2 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#08243D] text-[#F7C948] font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full transition-colors cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#08243D] text-[#F7C948] font-bold'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>
      )}

      {/* Notifications List Body */}
      {displayedNotifications.length === 0 ? (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <BellOff className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#08243D]">
            {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Hiện chưa có thông báo mới'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
            {filter === 'unread'
              ? 'Tất cả thông báo của bạn đã được đọc.'
              : 'Mọi cập nhật về dịch vụ và tài khoản sẽ hiển thị ở đây.'}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto max-h-[360px] divide-y divide-slate-100">
          {displayedNotifications.map((notification) => {
            const isRead = Boolean(notification.isRead ?? notification.is_read);
            const title = notification.title || 'Thông báo hệ thống';
            const message = notification.content || notification.message || '';
            const rawDate = notification.createdAt || notification.created_at;
            const timeFormatted = formatNotificationTime(rawDate);
            const visual = getNotificationVisual(notification.type, title);

            return (
              <div
                key={notification.id}
                onClick={() => {
                  if (!isRead) markAsRead(notification.id);
                  if (notification.link || notification.actionUrl) {
                    window.location.href = notification.link || notification.actionUrl!;
                  }
                }}
                className={`p-4 transition-all cursor-pointer flex items-start gap-3.5 relative ${
                  !isRead
                    ? 'bg-amber-50/20 hover:bg-amber-50/40 border-l-3 border-[#08243D]'
                    : 'bg-white hover:bg-slate-50/80 border-l-3 border-transparent'
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${visual.bg}`}
                >
                  {visual.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs font-bold leading-snug line-clamp-1 ${
                        !isRead ? 'text-[#08243D]' : 'text-slate-700'
                      }`}
                    >
                      {title}
                    </h4>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#F7C948] shrink-0" title="Chưa đọc" />
                    )}
                  </div>

                  {message && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {message}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-1.5">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{timeFormatted}</span>
                  </div>
                </div>

                {/* Mark as read tick on hover */}
                {!isRead && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="text-slate-400 hover:text-[#08243D] p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 self-center"
                    title="Đánh dấu đã đọc"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
