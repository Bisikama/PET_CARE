'use client';

import React, { useState } from 'react';
import { useChatRoom } from '../hooks/useChatRoom';

interface ChatWindowModalProps {
  roomId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWindowModal: React.FC<ChatWindowModalProps> = ({ roomId, isOpen, onClose }) => {
  const { rooms, currentRoomId, messages, isLoading, isSending, error, setActiveRoomId, sendMediaMessage } = useChatRoom(isOpen ? roomId : null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');

  if (!isOpen) return null;

  const handleSendMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;
    const ok = await sendMediaMessage({ mediaUrl, caption });
    if (ok) {
      setMediaUrl('');
      setCaption('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900 flex flex-col h-[520px]">
        <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trò Chuyện & Nhắn Tin</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-600 dark:bg-red-950/40">{error}</div>
        )}

        <div className="flex flex-1 gap-4 mt-3 overflow-hidden">
          {/* Room List Sidebar */}
          <div className="w-1/3 border-r pr-3 space-y-2 overflow-y-auto dark:border-gray-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Phòng Chat</h4>
            {rooms.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">Chưa có phòng chat nào.</p>
            ) : (
              rooms.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setActiveRoomId(r.id)}
                  className={`p-2.5 rounded-xl cursor-pointer transition text-xs ${
                    currentRoomId === r.id
                      ? 'bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'hover:bg-gray-50 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <div className="truncate">{r.name || `Phòng #${r.id.slice(0, 6)}`}</div>
                  {r.lastMessage && <div className="text-[11px] text-gray-400 truncate mt-0.5">{r.lastMessage}</div>}
                </div>
              ))
            )}
          </div>

          {/* Active Chat Messages */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex-1 overflow-y-auto space-y-3 p-2 border rounded-xl dark:border-gray-800">
              {isLoading ? (
                <div className="py-12 text-center text-xs text-gray-400">Đang tải tin nhắn...</div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">Chưa có tin nhắn nào trong phòng này.</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="rounded-lg bg-gray-50 p-2.5 text-xs dark:bg-gray-800/70">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{m.senderName || 'Thành viên'}</div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{m.content}</p>
                    {m.mediaUrl && (
                      <img src={m.mediaUrl} alt="media" className="mt-2 rounded-lg max-h-32 object-cover" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Form Send Media */}
            <form onSubmit={handleSendMedia} className="mt-3 flex gap-2">
              <input
                type="text"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Dán URL hình ảnh / media..."
                className="flex-1 rounded-lg border p-2 text-xs dark:bg-gray-800 dark:border-gray-700"
              />
              <button
                type="submit"
                disabled={isSending || !currentRoomId}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Gửi Media
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
