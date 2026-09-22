import { useEffect } from 'react';
import { useChatStore } from '../stores/chat.store';

export const useChatRoom = (roomId?: string | null) => {
  const {
    rooms,
    activeRoomId,
    messagesByRoomId,
    isLoading,
    isSending,
    isOpen,
    error,
    openModal,
    closeModal,
    setActiveRoomId,
    fetchRooms,
    fetchMessages,
    sendMediaMessage,
    sendMessage,
  } = useChatStore();

  const currentRoomId = roomId || activeRoomId;

  useEffect(() => {
    fetchRooms(true);
  }, [fetchRooms]);

  useEffect(() => {
    if (!currentRoomId) return;
    fetchMessages(currentRoomId, true);
    const interval = setInterval(() => {
      fetchMessages(currentRoomId, true);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentRoomId, fetchMessages]);

  const messages = currentRoomId ? messagesByRoomId[currentRoomId] || [] : [];

  return {
    rooms,
    currentRoomId,
    messages,
    isLoading,
    isSending,
    isOpen,
    error,
    openModal,
    closeModal,
    setActiveRoomId,
    sendMediaMessage: (dto: any) => currentRoomId ? sendMediaMessage(currentRoomId, dto) : Promise.resolve(false),
    sendMessage: (content: string, file?: File) => currentRoomId ? sendMessage(currentRoomId, content, file) : Promise.resolve(false),
    refetch: () => {
      fetchRooms(true);
      if (currentRoomId) fetchMessages(currentRoomId, true);
    },
  };
};
