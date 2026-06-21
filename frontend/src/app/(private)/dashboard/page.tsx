import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import {
  Dog,
  CalendarCheck2,
  HeartHandshake,
  TrendingUp,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { name: 'Thú cưng đăng ký', value: '12', icon: Dog, change: '+2 trong tuần này', color: 'text-teal-600 bg-teal-50' },
    { name: 'Lịch đặt hôm nay', value: '5', icon: CalendarCheck2, change: '1 lịch đang chờ duyệt', color: 'text-indigo-600 bg-indigo-50' },
    { name: 'Dịch vụ đang hoạt động', value: '8', icon: HeartHandshake, change: 'Hoạt động bình thường', color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Doanh thu tháng', value: '15.4Mđ', icon: TrendingUp, change: '+12% so với tháng trước', color: 'text-amber-600 bg-amber-50' },
  ];

  const recentBookings = [
    { id: 'BK-1001', petName: 'Lu Lu', owner: 'Trần Văn A', service: 'Spa & Cắt tỉa lông', time: '14:30 - 21/06/2026', status: 'Đang xử lý', statusColor: 'bg-amber-50 text-amber-700 border-amber-100' },
    { id: 'BK-1002', petName: 'Miu Miu', owner: 'Nguyễn Thị B', service: 'Khám sức khỏe tổng quát', time: '16:00 - 21/06/2026', status: 'Đã xác nhận', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { id: 'BK-1003', petName: 'Ki Ki', owner: 'Phạm Văn C', service: 'Tắm & Sấy khô', time: '10:00 - 22/06/2026', status: 'Đã xác nhận', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Xin chào, Admin! 👋</h2>
          <p className="text-sm text-slate-400 mt-1">Chúc bạn có một ngày làm việc hiệu quả tại hệ thống Pet Care.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={ROUTES.BOOKINGS}>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4" />
              Lịch đặt mới
            </Button>
          </Link>
          <Link href={ROUTES.PETS}>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm Thú Cưng
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-500">{stat.name}</span>
                <div className={`p-2.5 rounded-xl ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                <p className="text-xs font-medium text-slate-400 mt-1">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Recent Bookings */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Đặt lịch gần đây</h3>
            <Link href={ROUTES.BOOKINGS} className="text-sm font-semibold text-teal-600 hover:underline">
              Xem tất cả
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3 font-semibold">Mã</th>
                  <th className="pb-3 font-semibold">Thú cưng</th>
                  <th className="pb-3 font-semibold">Dịch vụ</th>
                  <th className="pb-3 font-semibold">Thời gian</th>
                  <th className="pb-3 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-600">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-800">{booking.id}</td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-700">{booking.petName}</div>
                      <div className="text-xs text-slate-400">{booking.owner}</div>
                    </td>
                    <td className="py-3.5">{booking.service}</td>
                    <td className="py-3.5 text-xs text-slate-400">{booking.time}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${booking.statusColor}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Quick action cards / guidelines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800">Hướng dẫn nhanh</h3>
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center font-bold text-teal-600 shrink-0 text-xs">
                1
              </div>
              <p>
                Thêm thông tin thú cưng của khách hàng vào mục <strong>Thú cưng</strong>.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center font-bold text-teal-600 shrink-0 text-xs">
                2
              </div>
              <p>
                Tạo cuộc hẹn đặt lịch chăm sóc hoặc lịch tái khám ở tab <strong>Đặt lịch</strong>.
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center font-bold text-teal-600 shrink-0 text-xs">
                3
              </div>
              <p>
                Kiểm tra thông tin hồ sơ của khách hàng và lịch sử hóa đơn trong tab <strong>Tài khoản</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
