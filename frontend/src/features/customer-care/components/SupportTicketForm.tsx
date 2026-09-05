'use client';

import React, { useState } from 'react';
import { useCustomerCareMutations } from '../hooks/useCustomerCare';
import { SupportTicketCategory } from '../types';

interface SupportTicketFormProps {
  onSuccess?: () => void;
}

export function SupportTicketForm({ onSuccess }: SupportTicketFormProps) {
  const { createTicket, loading, error } = useCustomerCareMutations();
  const [category, setCategory] = useState<SupportTicketCategory>(SupportTicketCategory.GENERAL);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket({ category, title, description });
      setTitle('');
      setDescription('');
      setCategory(SupportTicketCategory.GENERAL);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 w-full max-w-lg">
      <h3 className="text-xl font-bold text-slate-800 mb-6">Tạo Yêu Cầu Hỗ Trợ</h3>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Loại Hỗ Trợ</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          >
            <option value={SupportTicketCategory.GENERAL}>Câu hỏi chung</option>
            <option value={SupportTicketCategory.PAYMENT}>Thanh toán</option>
            <option value={SupportTicketCategory.ACCOUNT}>Tài khoản</option>
            <option value={SupportTicketCategory.TECHNICAL}>Kỹ thuật</option>
            <option value={SupportTicketCategory.OTHER}>Khác</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tiêu đề</label>
          <input 
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tóm tắt vấn đề của bạn..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả chi tiết</label>
          <textarea 
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-colors"
        >
          {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
        </button>
      </form>
    </div>
  );
}
