'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useChatRoom } from '../hooks/useChatRoom';
import { Send, Paperclip, X as XIcon, Image as ImageIcon, MessageSquare } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 flex flex-col h-[560px] border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Trò Chuyện Ca Làm Việc {partnerName ? `- ${user?.role === 'CUSTOMER' ? 'Chuyên viên' : 'Khách hàng'}: ${partnerName}` : ''}
              </h3>
              <p className="text-xs text-slate-400">Kênh trao đổi trực tiếp an toàn giữa Khách hàng & Chuyên viên PetCare</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }} 
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng cửa sổ chat"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-semibold text-rose-600 dark:bg-rose-950/40">{error}</div>
        )}

        <div className="flex flex-1 gap-4 mt-4 overflow-hidden">
          {/* Room List Sidebar */}
          <div className="w-1/3 border-r pr-3 space-y-2 overflow-y-auto dark:border-slate-800">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">Ca làm việc trao đổi</h4>
            {filteredRooms.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center italic">Không có ca làm việc nào đang cần trao đổi.</p>
            ) : (
              filteredRooms.map((r: any) => {
                const isSelected = currentRoomId === r.id;
                const roomTitle = getRoomTitle(r);
                const lastMsg = r.lastMessage || r.chat_messages?.[0]?.content || 'Chưa có tin nhắn';
                return (
                  <div
                    key={r.id}
                    onClick={() => setActiveRoomId(r.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all text-xs border ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-sm'
                        : 'bg-slate-50/50 hover:bg-slate-100/80 border-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate font-bold text-slate-800 dark:text-slate-100">{roomTitle}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-1 font-normal">{lastMsg}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Chat Messages */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto space-y-3 p-3 border rounded-2xl bg-slate-50/30 dark:bg-slate-950/30 dark:border-slate-800">
              {isLoading ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400">Đang tải tin nhắn...</div>
              ) : safeMessages.length === 0 ? (
                <div className="py-16 text-center text-xs font-semibold text-slate-400 flex flex-col items-center">
                  <img src="/images/empty-chat.png" alt="Empty Chat" className="w-24 h-24 mb-4 object-contain opacity-80" />
                  Chưa có tin nhắn nào trong phòng này. Nhập tin nhắn bên dưới để bắt đầu trao đổi.
                </div>
              ) : (
                safeMessages.map((m: any) => {
                  const content = m.content || m.text || '';
                  const isMedia = m.message_type === 'IMAGE' || m.message_type === 'VIDEO' || content.startsWith('http');
                  const isMe = user?.id && (m.sender_id === user.id || m.senderId === user.id);
                  const timeStr = (m.created_at || m.createdAt)
                    ? new Date(m.created_at || m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '';

                  return (
                    <div key={m.id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2.5`}>
                      <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isMe && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                            {(m.senderName || partnerName || 'U').slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`px-4 py-2.5 text-xs font-medium shadow-sm transition-all ${
                            isMe
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-150 dark:border-slate-700 rounded-2xl rounded-tl-xs'
                          }`}
                        >
                          {!isMe && (
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                              {m.senderName || partnerName || 'Đối tác'}
                            </div>
                          )}
                          {!isMedia && content && <p className="leading-relaxed whitespace-pre-wrap">{content}</p>}
                          {isMedia && content && (
                            <img src={content} alt="media" className="mt-1.5 rounded-xl max-h-48 object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                          )}
                          <div className={`text-[9px] mt-1 ${isMe ? 'text-emerald-100 text-right' : 'text-slate-400 text-right'}`}>
                            {timeStr}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Unified Send Form (Text + File) */}
            <form onSubmit={handleSendMessage} className="mt-3 space-y-2">
              {/* Attached file preview */}
              {attachedFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
                  <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-medium truncate flex-1">{attachedFile.name}</span>
                  <button type="button" onClick={handleRemoveFile} className="text-blue-400 hover:text-blue-600">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                {/* File attach button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Đính kèm file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Text input */}
                <input
                  type="text"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Nhập nội dung tin nhắn..."
                  className="flex-1 rounded-xl border border-slate-200 p-2.5 text-xs font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />

                {/* Send button */}
                <button
                  type="submit"
                  disabled={isSending || !currentRoomId || (!textContent.trim() && !attachedFile)}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

