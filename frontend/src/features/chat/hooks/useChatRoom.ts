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
  } = useChatStore();

  const currentRoomId = roomId || activeRoomId;

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (currentRoomId) {
      fetchMessages(currentRoomId);
    }
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
    refetch: () => {
      fetchRooms(true);
      if (currentRoomId) fetchMessages(currentRoomId, true);
    },
  };
};
