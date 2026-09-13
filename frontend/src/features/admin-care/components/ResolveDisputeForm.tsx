'use client';

import React, { useState } from 'react';
import { useAdminCareMutations } from '../hooks/useAdminCare';
import { DisputeDecision } from '../types';

interface ResolveDisputeFormProps {
  disputeId: string;
  onSuccess?: () => void;
}

export function ResolveDisputeForm({ disputeId, onSuccess }: ResolveDisputeFormProps) {
  const { resolveDispute, loading, error } = useAdminCareMutations();
  const [decision, setDecision] = useState<DisputeDecision>(DisputeDecision.FULL_REFUND);
  const [resolutionNote, setResolutionNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resolveDispute(disputeId, { decision, resolutionNote });
      setResolutionNote('');
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error is handled by hook
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Xử lý Khiếu nại</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Quyết định giải quyết</label>
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value as DisputeDecision)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          >
            <option value={DisputeDecision.FULL_REFUND}>Hoàn 100% tiền (Lỗi Provider)</option>
            <option value={DisputeDecision.PARTIAL_REFUND}>Hoàn 50% tiền (Lỗi chung)</option>
            <option value={DisputeDecision.NO_REFUND}>Không hoàn tiền (Lỗi Customer)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú độ phân giải</label>
          <textarea
            required
            rows={3}
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Lý do đưa ra quyết định này..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || !resolutionNote}
          className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận Giải quyết'}
        </button>
      </form>
    </div>
  );
}
