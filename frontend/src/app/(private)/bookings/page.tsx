import { Button } from '@/components/ui/Button';
import { Calendar, Plus, Check, X, Eye } from 'lucide-react';

export default function BookingsPage() {
  const bookings = [
    { id: 'BK-1001', petName: 'Lu Lu', owner: 'Trần Văn A', service: 'Spa & Cắt tỉa lông', time: '14:30 - 21/06/2026', price: '350.000đ', status: 'Đang xử lý', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { id: 'BK-1002', petName: 'Miu Miu', owner: 'Nguyễn Thị B', service: 'Khám sức khỏe tổng quát', time: '16:00 - 21/06/2026', price: '200.000đ', status: 'Đã xác nhận', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { id: 'BK-1003', petName: 'Ki Ki', owner: 'Phạm Văn C', service: 'Tắm & Sấy khô', time: '10:00 - 22/06/2026', price: '150.000đ', status: 'Đã xác nhận', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { id: 'BK-1004', petName: 'Bông Bông', owner: 'Lê Văn D', service: 'Khách sạn thú cưng (2 ngày)', time: '08:00 - 25/06/2026', price: '600.000đ', status: 'Đã hủy', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lịch đặt dịch vụ</h2>
          <p className="text-sm text-slate-400 mt-1">Quản lý các cuộc hẹn chăm sóc, spa và điều trị thú cưng.</p>
        </div>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Đặt lịch mới
        </Button>
      </div>

      {/* Bookings List Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold">
                <th className="px-6 py-4 font-semibold">Mã lịch</th>
                <th className="px-6 py-4 font-semibold">Khách hàng / Thú cưng</th>
                <th className="px-6 py-4 font-semibold">Dịch vụ yêu cầu</th>
                <th className="px-6 py-4 font-semibold">Thời gian hẹn</th>
                <th className="px-6 py-4 font-semibold">Chi phí</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4.5 font-semibold text-slate-800">{booking.id}</td>
                  <td className="px-6 py-4.5">
                    <div className="font-semibold text-slate-700">{booking.owner}</div>
                    <div className="text-xs text-slate-400">Thú cưng: {booking.petName}</div>
                  </td>
                  <td className="px-6 py-4.5">{booking.service}</td>
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {booking.time}
                    </div>
                  </td>
                  <td className="px-6 py-4.5 font-medium text-slate-700">{booking.price}</td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${booking.color}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="ghost" className="h-8 px-2.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                        <X className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2.5 text-slate-400 hover:text-slate-700">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
