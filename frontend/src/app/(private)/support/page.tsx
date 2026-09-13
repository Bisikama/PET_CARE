'use client';

import React, { useState } from 'react';
import { Headphones, Plus, LifeBuoy, ShieldAlert, MessageCircle, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TicketList, SupportTicketForm, TicketDetailModal } from '@/features/customer-care/components';
import { Portal } from '@/components/ui/Portal';

export default function CustomerSupportPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-[32px] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Headphones className="w-4 h-4" /> Trung tâm Hỗ trợ Khách hàng
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Gửi yêu cầu hỗ trợ, giải đáp thắc mắc về đơn hàng, thanh toán hoặc sự cố dịch vụ. Đội ngũ CSKH PetCare luôn hoạt động 24/7.
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold h-12 px-6 rounded-2xl shadow-lg shadow-blue-500/30 shrink-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo yêu cầu mới
          </Button>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <LifeBuoy className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Hỗ trợ 24/7</h3>
            <p className="text-xs text-slate-500 mt-0.5">Xử lý vé hỗ trợ liên tục</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Bảo vệ & Khẩn cấp</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ưu tiên các sự cố an toàn</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-green-50 text-green-600 shrink-0">
            <MessageCircle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Phản hồi nhanh</h3>
            <p className="text-xs text-slate-500 mt-0.5">Trung bình phản hồi trong 15p</p>
          </div>
        </div>
      </div>

      {/* Ticket List Section */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Danh sách Yêu Cầu Hỗ Trợ của bạn</h2>
              <p className="text-xs text-slate-500">Xem tiến độ xử lý và trao đổi với nhân viên hỗ trợ</p>
            </div>
          </div>
        </div>

        <TicketList onSelectTicket={(id: string) => setSelectedTicketId(id)} />
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="relative max-w-lg w-full">
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
