'use client';

import React, { useState } from 'react';
import { ShieldCheck, MessageSquare, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminTicketList, AdminDisputeList } from '@/features/admin-care/components';

export default function AdminSupportPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'disputes'>('tickets');

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-[32px] p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Quản trị CSKH & Tranh chấp
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Trung tâm Xử lý Hỗ trợ & Khiếu nại
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Quản lý tất cả yêu cầu hỗ trợ từ khách hàng, phản hồi thắc mắc và ra quyết định giải quyết tranh chấp hợp đồng đặt dịch vụ.
          </p>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'tickets'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Yêu cầu hỗ trợ (Tickets)
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
            activeTab === 'disputes'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Tranh chấp & Khiếu nại (Disputes)
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Danh sách Yêu cầu hỗ trợ (Tickets)</h2>
            </div>
            <AdminTicketList />
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Danh sách Tranh chấp / Khiếu nại</h2>
            </div>
            <AdminDisputeList />
          </div>
        )}
      </div>
    </div>
  );
}
