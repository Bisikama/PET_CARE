'use client';

import React, { useState } from 'react';
import { Headphones, Plus, LifeBuoy, ShieldAlert, MessageCircle, FileText, X } from 'lucide-react';
import { TicketList, SupportTicketForm, TicketDetailModal } from '@/features/customer-care/components';
import { Portal } from '@/components/ui/Portal';

export default function CustomerSupportPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in select-none">
      {/* Clean Navy Banner */}
      <div className="bg-[#08243D] rounded-3xl p-8 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F7C948]">
              Trung tâm Hỗ trợ Khách hàng
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Gửi yêu cầu hỗ trợ, giải đáp thắc mắc về đơn đặt lịch, thanh toán Escrow hoặc sự cố dịch vụ 24/7.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#F7C948] hover:bg-[#e5b83b] text-[#08243D] font-bold text-xs h-11 px-5 rounded-xl shrink-0 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo yêu cầu mới
          </button>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-100 text-[#08243D] shrink-0">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#08243D] text-sm">Hỗ trợ 24/7</h3>
            <p className="text-xs text-slate-500 mt-0.5">Xử lý phiếu hỗ trợ liên tục</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-100 text-[#08243D] shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#08243D] text-sm">Bảo vệ Escrow</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ưu tiên bảo vệ thanh toán</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-100 text-[#08243D] shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#08243D] text-sm">Phản hồi nhanh</h3>
            <p className="text-xs text-slate-500 mt-0.5">Trung bình phản hồi trong 15p</p>
          </div>
        </div>
      </div>

      {/* Ticket List Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/70 shadow-2xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-100 text-[#08243D]">
            <FileText className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#08243D]">Danh sách Yêu Cầu Hỗ Trợ</h2>
            <p className="text-xs text-slate-400">Xem tiến độ xử lý và trao đổi với chuyên viên CSKH</p>
          </div>
        </div>

        <TicketList onSelectTicket={(id: string) => setSelectedTicketId(id)} />
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fade-in">
            <div className="relative max-w-lg w-full animate-scale-up">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
              <SupportTicketForm
                onSuccess={() => {
                  setShowCreateModal(false);
                }}
              />
            </div>
          </div>
        </Portal>
      )}

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        ticketId={selectedTicketId}
      />
    </div>
  );
}


