'use client';

import React, { useEffect, useState } from 'react';
import { X, Send, User, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAdminTicketDetails, useAdminCareMutations } from '../hooks/useAdminCare';
import { TicketStatus } from '../types';
import { Portal } from '@/components/ui/Portal';

interface AdminTicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
  onSuccess?: () => void;
}

export const AdminTicketDetailModal: React.FC<AdminTicketDetailModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  onSuccess,
}) => {
  const { ticket, loading, error, fetchTicketDetails } = useAdminTicketDetails(ticketId || '');
  const { replyTicketAdmin, updateTicketStatus, loading: mutationLoading } = useAdminCareMutations();
  const [replyContent, setReplyContent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>(TicketStatus.IN_PROGRESS);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicketDetails(true);
    }
  }, [isOpen, ticketId]);

  useEffect(() => {
    if (ticket) {
      setSelectedStatus(ticket.status);
    }
  }, [ticket]);

  if (!isOpen || !ticketId) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
      await replyTicketAdmin(ticketId, { content: replyContent });
      setReplyContent('');
      fetchTicketDetails(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      await updateTicketStatus(ticketId, { status: newStatus });
      setSelectedStatus(newStatus);
      fetchTicketDetails(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error handled in hook
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-slate-100 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-indigo-600"></div>

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pb-4 border-b border-slate-100 pr-8 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h3 className="text-xl font-bold text-slate-800">
              Admin Quản lý Ticket #{ticketId.substring(0, 8)}
            </h3>

            {/* Quick Status Change */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                disabled={mutationLoading}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={TicketStatus.OPEN}>Chờ xử lý (OPEN)</option>
                <option value={TicketStatus.IN_PROGRESS}>Đang xử lý (IN_PROGRESS)</option>
                <option value={TicketStatus.RESOLVED}>Đã giải quyết (RESOLVED)</option>
                <option value={TicketStatus.CLOSED}>Đã đóng (CLOSED)</option>
              </select>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-700">{ticket?.title || 'Đang tải...'}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Tạo lúc: {ticket?.created_at ? new Date(ticket.created_at).toLocaleString('vi-VN') : ''}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
          {loading && !ticket ? (
            <div className="text-center py-12 text-slate-400 text-sm">Đang tải nội dung...</div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-2xl font-medium">{error}</div>
          ) : (
            <>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-sm space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Yêu cầu từ khách hàng:</span>
                <p className="text-slate-800 whitespace-pre-wrap">{ticket?.description}</p>
              </div>

              {(() => {
                const messagesList = ticket?.support_ticket_messages || ticket?.messages || [];
                const customerUserId = ticket?.user_id || ticket?.customer_id;
                
                if (messagesList.length === 0) {
                  return (
                    <div className="text-center py-4 text-slate-400 text-xs italic">
                      Chưa có trao đổi nào thêm.
                    </div>
                  );
                }

                return messagesList.map((msg: any) => {
                  const isAdmin = msg.sender_id !== customerUserId;
                  const messageText = msg.content || msg.message;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-slate-500">
                          {isAdmin ? 'Admin / CSKH' : msg.sender?.full_name || 'Khách hàng'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl max-w-[85%] text-sm whitespace-pre-wrap ${
                          isAdmin
                            ? 'bg-purple-600 text-white rounded-tr-none shadow-md shadow-purple-500/10'
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

        {/* Admin Reply Form */}
        <div className="pt-4 border-t border-slate-100">
          <form onSubmit={handleSendReply} className="flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Nhập câu trả lời gửi đến khách hàng..."
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm text-slate-800"
            />
            <Button
              type="submit"
              disabled={mutationLoading || !replyContent.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-11 px-5 rounded-2xl shrink-0"
            >
              <Send className="w-4 h-4 mr-1" />
              {mutationLoading ? 'Đang gửi...' : 'Phản hồi'}
            </Button>
          </form>
        </div>
      </div>
    </div>
    </Portal>
  );
};
