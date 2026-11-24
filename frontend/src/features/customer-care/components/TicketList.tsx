'use client';

import React, { useEffect } from 'react';
import { Headphones, Calendar, ChevronRight } from 'lucide-react';
import { useMyTickets } from '../hooks/useCustomerCare';
import { TicketStatus } from '../types';

interface TicketListProps {
  onSelectTicket?: (ticketId: string) => void;
}

export function TicketList({ onSelectTicket }: TicketListProps) {
  const { myTickets, loading, error, fetchTickets } = useMyTickets();

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case TicketStatus.IN_PROGRESS:
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case TicketStatus.RESOLVED:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case TicketStatus.CLOSED:
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return 'Đang mở';
      case TicketStatus.IN_PROGRESS:
        return 'Đang xử lý';
      case TicketStatus.RESOLVED:
        return 'Đã giải quyết';
      case TicketStatus.CLOSED:
        return 'Đã đóng';
      default:
        return status;
    }
  };

  if (loading && !myTickets) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-7 h-7 border-3 border-slate-200 border-t-[#08243D] rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Đang tải danh sách phiếu hỗ trợ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold">
        {error}
      </div>
    );
  }

  if (!myTickets || myTickets.length === 0) {
    return (
      <div className="text-center py-14 px-6 bg-slate-50/70 rounded-3xl border border-dashed border-slate-200 space-y-3">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-[#08243D]">
          <Headphones className="w-6 h-6 text-teal-600" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <p className="text-sm font-black text-[#08243D]">Bạn chưa có phiếu yêu cầu hỗ trợ nào</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Mọi dịch vụ của bạn đang hoạt động bình thường. Nếu cần trợ giúp, hãy bấm nút <strong>&ldquo;Tạo phiếu yêu cầu mới&rdquo;</strong> bất cứ lúc nào.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3.5">
      {myTickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
          className="card-hover-lift group bg-white p-5 rounded-2xl border border-slate-200/80 cursor-pointer"
        >
          <div className="flex justify-between items-start gap-3 mb-2">
            <h4 className="font-black text-[#08243D] text-base group-hover:text-teal-700 transition-colors">
              {ticket.title}
            </h4>
            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shrink-0 ${getStatusColor(ticket.status)}`}>
              {getStatusLabel(ticket.status)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3.5 line-clamp-2 leading-relaxed font-medium">
            {ticket.description}
          </p>
          <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 text-xs text-slate-400 font-semibold">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600" />
              {new Date(ticket.created_at).toLocaleDateString('vi-VN')}
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-slate-100 px-2.5 py-1 rounded-lg font-extrabold text-[11px] text-[#08243D]">
                {ticket.category}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#08243D] group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


