'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useChatRoom } from '../hooks/useChatRoom';
import { Send, Paperclip, X as XIcon, Image as ImageIcon, MessageSquare, Check } from 'lucide-react';

interface ChatWindowModalProps {
  roomId?: string | null;
  bookingId?: string | null;
  partnerName?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindowModal: React.FC<ChatWindowModalProps> = ({ roomId, bookingId, partnerName, isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { rooms, currentRoomId, messages, isLoading, isSending, error, setActiveRoomId, sendMessage } = useChatRoom(isOpen ? roomId : null);
  const [textContent, setTextContent] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [bookingMap, setBookingMap] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeMessages = Array.isArray(messages) ? messages : [];

  useEffect(() => {
    if (!isOpen) return;
    const fetchBookingDetails = async () => {
      try {
        if (user?.role === 'CUSTOMER') {
          const { bookingService } = await import('@/features/booking/services/booking.service');
          const list = await bookingService.getMyBookings();
          if (Array.isArray(list)) {
            const map: Record<string, any> = {};
            list.forEach((b: any) => {
              const pName = b.provider_profiles?.users?.fullName ||
                b.provider_working_slots?.provider_working_days?.provider_profiles?.users?.fullName ||
                b.providerName;
              map[b.id] = {
                status: b.status,
                providerName: pName,
                customerName: b.address_snapshot?.receiverName || user?.fullName
              };
            });
            setBookingMap(map);
          }
        }
      } catch (err) {
        console.error('Failed to fetch booking details for chat modal:', err);
      }
    };

    fetchBookingDetails();
  }, [isOpen, user?.role, user?.fullName]);

  // Filter active rooms: if bookingId provided, focus only on that booking's room. Otherwise filter out COMPLETED/CANCELLED rooms.
  const filteredRooms = React.useMemo(() => {
    if (bookingId) {
      const matched = safeRooms.filter((r: any) => 
        (r.booking_id && r.booking_id.toLowerCase() === bookingId.toLowerCase()) || 
        (r.bookingId && r.bookingId.toLowerCase() === bookingId.toLowerCase())
      );
      if (matched.length > 0) return matched;
    }
    return safeRooms.filter((r: any) => {
      const bId = r.booking_id || r.bookingId;
      const bInfo = bookingMap[bId];
      const status = r.bookings?.status || r.booking_status || bInfo?.status;
      // Filter out finished/cancelled/rejected or inactive rooms
      if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'REJECTED' || r.is_active === false) {
        return false;
      }
      return true;
    });
  }, [safeRooms, bookingId, bookingMap]);

  useEffect(() => {
    if (filteredRooms.length > 0 && (!currentRoomId || !filteredRooms.some((r: any) => r.id === currentRoomId))) {
      setActiveRoomId(filteredRooms[0].id);
    }
  }, [filteredRooms, currentRoomId, setActiveRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [safeMessages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textContent.trim() && !attachedFile) return;
    
    const ok = await sendMessage(textContent.trim(), attachedFile || undefined);
    if (ok) {
      setTextContent('');
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getRoomTitle = (r: any) => {
    const bId = r.booking_id || r.bookingId || r.id;
    const bInfo = bookingMap[bId];

    const cName = r.users_chat_rooms_customer_idTousers?.fullName || r.bookings?.address_snapshot?.receiverName || r.customerName || r.customer_name || bInfo?.customerName || partnerName;
    const pName = r.users_chat_rooms_provider_user_idTousers?.fullName || r.providerName || r.provider_name || bInfo?.providerName || partnerName;
    const code = (bId || '').slice(0, 6).toUpperCase();

    if (user?.role === 'CUSTOMER') {
      const name = pName || partnerName || 'Người chăm sóc';
      return `Chuyên viên ${name} ${code ? `(#${code})` : ''}`;
    }

    const name = cName || partnerName || 'Khách hàng';
    return `Khách hàng ${name} ${code ? `(#${code})` : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-300 select-none">
      <div className="w-full max-w-5xl rounded-[2rem] bg-white shadow-2xl dark:bg-slate-950 flex flex-col h-[85vh] min-h-[600px] max-h-[900px] border border-slate-200/50 dark:border-slate-800/80 overflow-hidden ring-1 ring-slate-900/5">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/80 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/50">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Trò Chuyện {partnerName ? `- ${user?.role === 'CUSTOMER' ? 'Chuyên viên' : 'Khách hàng'}: ${partnerName}` : ''}
              </h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Kênh trao đổi trực tiếp an toàn trong thời gian thực hiện dịch vụ</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }} 
            className="rounded-full p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer active:scale-95"
            title="Đóng cửa sổ chat"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 rounded-2xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            {error}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden bg-slate-50/50 dark:bg-slate-900/20">
          {filteredRooms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
              <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-500 z-10 flex gap-4 sm:gap-6 items-end sm:items-start">
                {/* Avatar */}
                <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 relative group self-end sm:self-start mb-2 sm:mb-0">
                  <div className="absolute inset-0 bg-emerald-400/20 dark:bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-400/30 transition-colors duration-500 animate-pulse" />
                  <div className="relative w-full h-full flex items-center justify-center transform group-hover:-translate-y-1 transition-transform duration-300">
                    <img 
                      src="/Final%20des%20exe/Empt%20icon/Chat.png" 
                      alt="Chat icon" 
                      className="w-full h-full object-contain drop-shadow-xl" 
                    />
                  </div>
                </div>
                
                {/* Chat Bubble */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-[2rem] rounded-bl-sm sm:rounded-bl-[2rem] sm:rounded-tl-sm shadow-xl p-5 sm:p-7 border border-slate-100 dark:border-slate-700/50 relative">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 sm:mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    Xin chào!
                  </h3>
                  <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    Hiện tại <span className="font-semibold text-emerald-600 dark:text-emerald-400">không có cuộc trò chuyện nào</span> đang diễn ra.
                  </p>
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-700/30 leading-relaxed">
                    Tính năng nhắn tin chỉ khả dụng khi bạn có đơn đặt dịch vụ đang hoạt động. Khi đơn đã hoàn thành hoặc bị hủy, cuộc trò chuyện sẽ tự động được ẩn đi.
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                >
                  <XIcon className="w-4 h-4" />
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Room List Sidebar */}
              <div className="w-80 flex-shrink-0 border-r border-slate-200 dark:border-slate-800/80 flex flex-col bg-white dark:bg-slate-950 z-10">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/50">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Đang hoạt động ({filteredRooms.length})
                  </h4>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {filteredRooms.map((r: any) => {
                const isSelected = currentRoomId === r.id;
                const roomTitle = getRoomTitle(r);
                const lastMsg = r.lastMessage || r.chat_messages?.[0]?.content || 'Chưa có tin nhắn...';
                return (
                  <div
                    key={r.id}
                    onClick={() => setActiveRoomId(r.id)}
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col gap-1 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800/60 shadow-sm ring-1 ring-emerald-500/10'
                        : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800'
                    }`}
                  >
                    {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full" />}
                    <div className="flex justify-between items-center w-full">
                      <div className="truncate font-bold text-sm text-slate-800 dark:text-slate-100 pl-1">{roomTitle}</div>
                    </div>
                    <div className={`text-xs truncate pl-1 ${isSelected ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                      {lastMsg}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Chat Messages */}
          <div className="flex-1 flex flex-col justify-between bg-[url('/images/chat-bg-pattern.svg')] dark:bg-[url('/images/chat-bg-pattern-dark.svg')] bg-repeat bg-[length:300px_300px] relative">
            <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-[1px] pointer-events-none" />
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar relative z-10">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-400">Đang tải tin nhắn...</span>
                  </div>
                </div>
              ) : safeMessages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="py-12 px-6 text-center flex flex-col items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/60 dark:border-slate-800/60 shadow-xl max-w-sm">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 text-emerald-500">
                      <MessageSquare className="w-10 h-10" />
                    </div>
                    <h4 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-2">Phòng chat trống</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Chưa có tin nhắn nào trong phòng này. Nhập tin nhắn bên dưới để bắt đầu trao đổi với {user?.role === 'CUSTOMER' ? 'chuyên viên' : 'khách hàng'}.
                    </p>
                  </div>
                </div>
              ) : (
                safeMessages.map((m: any, idx: number) => {
                  const content = m.content || m.text || '';
                  const isMedia = m.message_type === 'IMAGE' || m.message_type === 'VIDEO' || content.startsWith('http');
                  const isMe = user?.id && (m.sender_id === user.id || m.senderId === user.id);
                  const timeStr = (m.created_at || m.createdAt)
                    ? new Date(m.created_at || m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '';
                  
                  const prevMsg: any = idx > 0 ? safeMessages[idx - 1] : null;
                  const isConsecutive = prevMsg && 
                    (prevMsg.sender_id === m.sender_id || prevMsg.senderId === m.senderId) && 
                    (new Date(m.created_at || m.createdAt).getTime() - new Date(prevMsg.created_at || prevMsg.createdAt).getTime() < 60000 * 5); // 5 mins

                  return (
                    <div key={m.id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                      <div className={`flex gap-3 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                        {!isMe && (
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-md ring-2 ring-white dark:ring-slate-900 ${isConsecutive ? 'opacity-0 invisible' : 'opacity-100'}`}>
                            {(m.senderName || partnerName || 'U').slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`px-4 py-3 text-sm font-medium shadow-sm transition-all relative group ${
                            isMe
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl rounded-br-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700/80 rounded-3xl rounded-bl-sm'
                          }`}
                        >
                          {!isMe && !isConsecutive && (
                            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                              {m.senderName || partnerName || 'Đối tác'}
                            </div>
                          )}
                          {!isMedia && content && <p className="leading-relaxed whitespace-pre-wrap">{content}</p>}
                          {isMedia && content && (
                            <div className="overflow-hidden rounded-2xl shadow-sm border border-black/5 dark:border-white/5 mt-1">
                              <img src={content} alt="media" className="max-h-64 object-cover w-full hover:scale-105 transition-transform duration-500 cursor-pointer" />
                            </div>
                          )}
                          <div className={`text-[10px] mt-1.5 flex items-center gap-1 ${isMe ? 'text-emerald-100/90 justify-end' : 'text-slate-400 justify-start'}`}>
                            {timeStr}
                            {isMe && <Check className="w-3 h-3 opacity-80" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/80 z-10">
              <form onSubmit={handleSendMessage} className="space-y-3">
                {/* Attached file preview */}
                {attachedFile && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/80 dark:bg-blue-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/50 animate-in fade-in slide-in-from-bottom-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-xl">
                      <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold truncate">{attachedFile.name}</p>
                      <p className="text-[10px] text-blue-500 dark:text-blue-400">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={handleRemoveFile} className="p-2 text-blue-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/80 rounded-[1.5rem] p-1 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500/50 transition-all shadow-sm">
                  {/* File attach button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 rounded-full p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition-colors mb-0.5 ml-1"
                    title="Đính kèm hình ảnh/video"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Text input */}
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Nhập tin nhắn... (Enter để gửi)"
                    className="flex-1 bg-transparent py-3.5 px-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none resize-none min-h-[44px] max-h-32 custom-scrollbar"
                    rows={1}
                  />

                  {/* Send button */}
                  <button
                    type="submit"
                    disabled={isSending || !currentRoomId || (!textContent.trim() && !attachedFile)}
                    className="shrink-0 rounded-full bg-emerald-500 p-3.5 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 transition-all shadow-md active:scale-95 mb-0.5 mr-1"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 ml-0.5" />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
        )}
      </div>
    </div>
  </div>
);
};

