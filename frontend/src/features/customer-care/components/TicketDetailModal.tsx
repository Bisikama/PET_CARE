'use client';

import React, { useEffect, useState } from 'react';
import { X, Send, User, MessageSquareCheck, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTicketDetails, useCustomerCareMutations } from '../hooks/useCustomerCare';
import { TicketStatus, SupportTicketCategory } from '../types';
import { Portal } from '@/components/ui/Portal';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
}

const CATEGORY_NAMES: Record<SupportTicketCategory, string> = {
  [SupportTicketCategory.ACCOUNT]: 'Tài khoản',
  [SupportTicketCategory.BOOKING_GUIDE]: 'Hướng dẫn đặt lịch',
  [SupportTicketCategory.TECHNICAL_ERROR]: 'Lỗi kỹ thuật',
  [SupportTicketCategory.NOTIFICATION]: 'Thông báo',
  [SupportTicketCategory.VOUCHER]: 'Ưu đãi / Voucher',
  [SupportTicketCategory.SERVICE_SUGGESTION]: 'Góp ý dịch vụ',
  [SupportTicketCategory.OTHER]: 'Khác',
};

const STATUS_BADGES: Record<TicketStatus, { label: string; color: string }> = {
  [TicketStatus.OPEN]: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  [TicketStatus.IN_PROGRESS]: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  [TicketStatus.RESOLVED]: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800 border-green-200' },
  [TicketStatus.CLOSED]: { label: 'Đã đóng', color: 'bg-slate-100 text-slate-700 border-slate-200' },
};

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  onClose,
  ticketId,
}) => {
  const { ticket, loading, error, fetchTicketDetails } = useTicketDetails(ticketId || '');
  const { replyTicket, loading: replyLoading } = useCustomerCareMutations();
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicketDetails(true);
    }
  }, [isOpen, ticketId]);

  if (!isOpen || !ticketId) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await replyTicket(ticketId, { content: replyContent });
      setReplyContent('');
      fetchTicketDetails(true);
    } catch (err) {
      // Error handled by mutation hook
    }
  };

  const isClosed = ticket?.status === TicketStatus.CLOSED || ticket?.status === TicketStatus.RESOLVED;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden">
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pb-4 border-b border-slate-100 pr-8">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {ticket && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STATUS_BADGES[ticket.status]?.color}`}>
                {STATUS_BADGES[ticket.status]?.label}
              </span>
            )}
            {ticket && (
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                <Tag className="w-3 h-3" /> {CATEGORY_NAMES[ticket.category]}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-800">{ticket?.title || 'Đang tải thông tin...'}</h3>
          <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Tạo lúc: {ticket?.created_at ? new Date(ticket.created_at).toLocaleString('vi-VN') : ''}
          </p>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          {loading && !ticket ? (
            <div className="text-center py-12 text-slate-400 text-sm">Đang tải chi tiết cuộc hội thoại...</div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl font-medium">{error}</div>
          ) : (
            <>
              {/* Ticket Initial Description */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <User className="w-4 h-4 text-blue-600" />
                  Nội dung yêu cầu ban đầu:
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{ticket?.description}</p>
              </div>

              {/* Thread Messages */}
              {(() => {
                const messagesList = ticket?.support_ticket_messages || ticket?.messages || [];
                const customerUserId = ticket?.user_id || ticket?.customer_id;
                
                if (messagesList.length === 0) {
                  return (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      Chưa có tin nhắn trao đổi thêm nào. CSKH sẽ sớm phản hồi bạn!
                    </div>
                  );
                }

                return messagesList.map((msg: any) => {
                  const isUserSender = msg.sender_id === customerUserId;
                  const messageText = msg.content || msg.message;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUserSender ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-500">
                          {isUserSender ? 'Bạn' : msg.sender?.full_name || 'Hỗ trợ viên CSKH'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap ${
                          isUserSender
                            ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                        }`}
                      >
                        {messageText}
                      </div>
                    </div>
                  );
                });
              })()}
            </>
          )}
        </div>

        {/* Footer Input Area */}
        <div className="pt-4 border-t border-slate-100">
          {isClosed ? (
            <div className="p-3 bg-slate-100 text-slate-500 text-center text-xs font-medium rounded-2xl">
              Yêu cầu hỗ trợ này đã được giải quyết hoặc đóng.
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="flex gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Nhập nội dung phản hồi..."
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm text-slate-800"
              />
              <Button
                type="submit"
                disabled={replyLoading || !replyContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-5 rounded-2xl shrink-0"
              >
                <Send className="w-4 h-4 mr-1" />
                {replyLoading ? 'Đang gửi...' : 'Gửi'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
    </Portal>
  );
};
