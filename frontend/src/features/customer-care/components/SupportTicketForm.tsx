'use client';

import React, { useState } from 'react';
import { useCustomerCareMutations } from '../hooks/useCustomerCare';
import { SupportTicketCategory } from '../types';

interface SupportTicketFormProps {
  onSuccess?: () => void;
}

export function SupportTicketForm({ onSuccess }: SupportTicketFormProps) {
  const { createTicket, loading, error } = useCustomerCareMutations();
  const [category, setCategory] = useState<SupportTicketCategory>(SupportTicketCategory.ACCOUNT);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket({ category, title, description });
      setTitle('');
      setDescription('');
      setCategory(SupportTicketCategory.ACCOUNT);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden">
      <div className="bg-[#08243D] px-6 py-5 text-white">
        <h3 className="text-lg font-bold">Tạo Yêu Cầu Hỗ Trợ</h3>
        <p className="text-xs text-slate-300 mt-0.5">Đội ngũ CSKH PetCare sẽ phản hồi trong thời gian sớm nhất</p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Danh mục hỗ trợ</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#08243D] bg-slate-50 text-xs font-semibold text-slate-800"
            >
              <option value={SupportTicketCategory.ACCOUNT}>Tài khoản</option>
              <option value={SupportTicketCategory.BOOKING_GUIDE}>Hướng dẫn đặt lịch</option>
              <option value={SupportTicketCategory.TECHNICAL_ERROR}>Lỗi kỹ thuật</option>
              <option value={SupportTicketCategory.NOTIFICATION}>Thông báo</option>
              <option value={SupportTicketCategory.VOUCHER}>Ưu đãi / Voucher</option>
              <option value={SupportTicketCategory.SERVICE_SUGGESTION}>Góp ý dịch vụ</option>
              <option value={SupportTicketCategory.OTHER}>Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tiêu đề</label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt vấn đề của bạn..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#08243D] text-xs font-semibold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mô tả chi tiết</label>
            <textarea 
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#08243D] text-xs font-medium text-slate-800 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#08243D] hover:bg-[#0c3254] text-[#F7C948] font-bold text-xs py-3 rounded-xl disabled:opacity-70 transition-colors cursor-pointer"
          >
            {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu Hỗ Trợ'}
          </button>
        </form>
      </div>
    </div>
  );
}
