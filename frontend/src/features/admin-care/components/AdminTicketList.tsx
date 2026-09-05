'use client';

import React, { useEffect } from 'react';
import { useAllTickets } from '../hooks/useAdminCare';
import { TicketStatus } from '../types';

export function AdminTicketList() {
  const { allTickets, loading, error, fetchTickets } = useAllTickets();

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

  if (loading && !allTickets) {
    return <div className="p-4 text-center text-slate-500">Đang tải danh sách...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold uppercase tracking-wider">
            <th className="p-4">Mã YC</th>
            <th className="p-4">Tiêu đề</th>
            <th className="p-4">Chuyên mục</th>
            <th className="p-4">Trạng thái</th>
            <th className="p-4">Ngày tạo</th>
            <th className="p-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {allTickets?.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-mono text-slate-500">#{ticket.id.substring(0, 8)}</td>
              <td className="p-4 font-medium text-slate-800">{ticket.title}</td>
              <td className="p-4">
                <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-600">
                  {ticket.category}
                </span>
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </td>
              <td className="p-4 text-slate-500">
                {new Date(ticket.created_at).toLocaleDateString('vi-VN')}
              </td>
              <td className="p-4 text-right">
                <button className="text-blue-600 font-medium hover:underline text-sm">
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
          {(!allTickets || allTickets.length === 0) && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-500">
                Chưa có yêu cầu hỗ trợ nào trong hệ thống.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
