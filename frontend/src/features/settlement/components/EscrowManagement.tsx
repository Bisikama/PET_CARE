import React, { useState } from 'react';
import { usePayoutRequests } from '../hooks/usePayoutRequests';
import { useSettlementActions } from '../hooks/useSettlementActions';
import { ShieldCheck, CheckCircle, XCircle, Search, DollarSign } from 'lucide-react';

export const EscrowManagement = () => {
  const { payoutRequests, isLoading, error } = usePayoutRequests();
  const { approvePayout, rejectPayout, releaseEscrow, refundCustomer } = useSettlementActions();
  const [bookingIdInput, setBookingIdInput] = useState('');

  const pendingRequests = payoutRequests.filter(r => r.status === 'PENDING');

  const handleRelease = async () => {
    if (!bookingIdInput) return;
    try {
      await releaseEscrow(bookingIdInput);
      alert('Giải phóng Escrow thành công');
      setBookingIdInput('');
    } catch (e) {
      alert('Lỗi giải phóng Escrow. Vui lòng kiểm tra lại ID.');
    }
  };

  const handleRefund = async () => {
    if (!bookingIdInput) return;
    try {
      await refundCustomer(bookingIdInput);
      alert('Hoàn tiền cho Customer thành công');
      setBookingIdInput('');
    } catch (e) {
      alert('Lỗi hoàn tiền. Vui lòng kiểm tra lại ID.');
    }
  };

  return (
   

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payout Requests */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col min-h-[400px]">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-800">Yêu cầu rút tiền</h3>
            <p className="text-sm text-slate-500">Danh sách các Provider yêu cầu rút tiền từ ví Escrow.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px]">
            {isLoading ? (
              <div className="text-center py-10 text-slate-500 font-medium text-sm">Đang tải dữ liệu...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-500 font-medium text-sm">{error}</div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-500 font-medium text-sm">Không có yêu cầu nào đang chờ</div>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex flex-col gap-3 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800">{req.providerName}</div>
                      <div className="text-xs text-slate-500 mt-1">Ngân hàng: <span className="font-semibold text-slate-700">{req.bankName}</span></div>
                      <div className="text-xs text-slate-500">STK: <span className="font-semibold text-slate-700">{req.accountNumber}</span> - {req.accountName}</div>
                    </div>
                    <div className="font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-sm border border-amber-100">
                      {new Intl.NumberFormat('vi-VN').format(req.amount)} đ
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button 
                      onClick={() => rejectPayout(req.id)}
                      className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle size={14} /> Từ chối
                    </button>
                    <button 
                      onClick={() => approvePayout(req.id)}
                      className="px-3 py-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle size={14} /> Duyệt & Giải ngân
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Manual Actions */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-lg font-bold text-slate-800">Thao tác thủ công</h3>
            <p className="text-sm text-slate-500">Giải quyết tranh chấp hoặc hoàn tiền ngoại lệ.</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700">Mã Booking (Booking ID)</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value)}
                  placeholder="Nhập mã booking cần xử lý..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleRelease}
                disabled={!bookingIdInput}
                className="flex flex-col items-center justify-center p-5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-2xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <DollarSign size={24} />
                <span className="font-bold text-sm text-center">Giải phóng cho Provider</span>
                <span className="text-[10px] text-teal-600/70 text-center font-medium">Chuyển tiền vào ví Provider</span>
              </button>

              <button 
                onClick={handleRefund}
                disabled={!bookingIdInput}
                className="flex flex-col items-center justify-center p-5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <DollarSign size={24} />
                <span className="font-bold text-sm text-center">Hoàn tiền Customer</span>
                <span className="text-[10px] text-rose-600/70 text-center font-medium">Customer nhận lại 100% tiền</span>
              </button>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs text-amber-700 font-medium leading-relaxed">
                <strong className="block mb-1 font-bold text-amber-800">Lưu ý:</strong> 
                Mọi thao tác thủ công đều được ghi log lưu vết trên hệ thống để đảm bảo minh bạch.
                Chỉ thực hiện khi có bằng chứng rõ ràng hoặc đã thông qua hội đồng quản trị.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
};
