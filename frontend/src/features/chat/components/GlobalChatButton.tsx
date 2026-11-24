'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatWindowModal } from './ChatWindowModal';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useChatRoom } from '../hooks/useChatRoom';

export const GlobalChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  
  const { rooms } = useChatRoom(null);
  
  const activeRooms = Array.isArray(rooms) ? rooms.filter((r: any) => {
    const status = r.bookings?.status || r.booking_status;
    return status !== 'COMPLETED' && status !== 'CANCELLED' && status !== 'REJECTED' && r.is_active !== false;
  }) : [];

  if (!user) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Tin nhắn"
        title="Tin nhắn hỗ trợ & chuyên viên"
        className="fixed bottom-6 right-6 z-[60] w-13 h-13 rounded-full bg-[#08243D] hover:bg-[#0c3254] text-[#F7C948] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 border border-[#F7C948]/30 cursor-pointer"
      >
        <MessageCircle className="w-6 h-6" />
        {activeRooms.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 rounded-full bg-rose-500 items-center justify-center text-[10px] font-bold text-white border-2 border-white">
            {activeRooms.length}
          </span>
        )}
      </button>

      <ChatWindowModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};


