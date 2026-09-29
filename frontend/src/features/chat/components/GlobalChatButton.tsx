'use client';

import React, { useState } from 'react';
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
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[60] w-14 h-14 md:w-16 md:h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1 active:scale-95 group border-2 border-emerald-500/20"
      >
        <div className="absolute inset-0 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <img 
          src="/Final%20des%20exe/Empt%20icon/Chat.png" 
          alt="Chat" 
          className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" 
        />
        {activeRooms.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-rose-500 items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white dark:border-slate-800">
              {activeRooms.length}
            </span>
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
