'use client';

import React, { useEffect } from 'react';
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
      case TicketStatus.OPEN: return 'bg-amber-100 text-amber-700';
      case TicketStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case TicketStatus.RESOLVED: return 'bg-emerald-100 text-emerald-700';
      case TicketStatus.CLOSED: return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN: return 'Mở';
      case TicketStatus.IN_PROGRESS: return 'Đang xử lý';
      case TicketStatus.RESOLVED: return 'Đã giải quyết';
      case TicketStatus.CLOSED: return 'Đã đóng';
      default: return status;
    }
  };

  if (loading && !myTickets) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm">
        {error}
      </div>
    );
  }

  if (!myTickets || myTickets.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
        Bạn chưa có yêu cầu hỗ trợ nào.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {myTickets.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-slate-800 text-lg">{ticket.title}</h4>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
              {getStatusLabel(ticket.status)}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-3 line-clamp-2">
            {ticket.description}
          </p>
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>{new Date(ticket.created_at).toLocaleDateString('vi-VN')}</span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-full font-semibold text-slate-600">{ticket.category}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

