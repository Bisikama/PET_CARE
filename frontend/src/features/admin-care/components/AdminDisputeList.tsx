'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAllDisputes } from '../hooks/useAdminCare';
import { ResolveDisputeForm } from './ResolveDisputeForm';
import { Dispute } from '../types';
import { Portal } from '@/components/ui/Portal';

export function AdminDisputeList() {
  const { allDisputes, loading, error, fetchDisputes } = useAllDisputes();
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  if (loading && !allDisputes) {
    return <div className="p-8 text-center text-slate-500 text-sm">Đang tải danh sách khiếu nại...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="p-4">Mã Đơn / Dispute</th>
              <th className="p-4">Tiêu đề & Lý do</th>
              <th className="p-4">Mô tả</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4">Ngày tạo</th>
              <th className="p-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {allDisputes?.map((dispute) => (
              <tr key={dispute.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-4 font-mono text-slate-500 text-xs">
                  <div>#{dispute.id.substring(0, 8)}</div>
                  <div className="text-[11px] text-slate-400">Booking: {dispute.booking_id.substring(0, 8)}...</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-slate-800">{dispute.title}</div>
                  <span className="inline-block mt-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200">
                    {dispute.reason}
                  </span>
                </td>
                <td className="p-4 text-slate-600 max-w-xs truncate">{dispute.description}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      dispute.status === 'RESOLVED'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {dispute.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500 text-xs">
                  {new Date(dispute.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4 text-right">
                  {dispute.status !== 'RESOLVED' ? (
                    <Button
                      onClick={() => setSelectedDispute(dispute)}
                      className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold h-9 px-4 rounded-xl"
                    >
                      Giải quyết
                    </Button>
                  ) : (
                    <span className="text-xs text-green-600 font-bold flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Đã xong
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {(!allDisputes || allDisputes.length === 0) && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                  Chưa có tranh chấp/khiếu nại nào cần xử lý.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Resolve Dispute Form */}
      {selectedDispute && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="relative max-w-md w-full">
              <button
                onClick={() => setSelectedDispute(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
              <ResolveDisputeForm
                disputeId={selectedDispute.id}
                onSuccess={() => {
                  setSelectedDispute(null);
                  fetchDisputes(true);
                }}
              />
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
