'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';

export default function ProfilePage() {
  const [name, setName] = React.useState('Admin');
  const [phone, setPhone] = React.useState('0987654321');
  const [address, setAddress] = React.useState('123 Đường ABC, Quận 1, TP. HCM');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');

    try {
      // Giả lập lưu
      await new Promise((resolve) => setTimeout(resolve, 800));
      setMessage('Cập nhật thông tin thành công!');
    } catch (err) {
      setMessage('Lỗi khi cập nhật thông tin.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Left Card: Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center font-bold text-3xl">
          A
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">{name}</h3>
          <p className="text-sm text-slate-400">Quản trị viên hệ thống</p>
        </div>
        <div className="w-full pt-4 border-t border-slate-50 text-left text-sm text-slate-500 space-y-3.5">
          <div className="flex items-center gap-2.5">
            <Mail className="h-4.5 w-4.5 text-slate-400" />
            <span>admin@petcare.com</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="h-4.5 w-4.5 text-slate-400" />
            <span>{phone || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="h-4.5 w-4.5 text-slate-400" />
            <span className="line-clamp-1">{address || 'Chưa cập nhật'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Shield className="h-4.5 w-4.5 text-slate-400" />
            <span className="font-medium text-teal-600 bg-teal-50/50 px-2 py-0.5 rounded text-xs">
              Quyền SuperAdmin
            </span>
          </div>
        </div>
      </div>

      {/* Right Card: Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Chỉnh sửa thông tin</h3>
          <p className="text-sm text-slate-400 mt-1">Thay đổi thông tin liên lạc cá nhân của bạn.</p>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-50 text-emerald-700 text-sm rounded-xl border border-emerald-100 font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="fullName">
                Họ và tên
              </label>
              <input
                id="fullName"
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white text-slate-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="phoneNo">
                Số điện thoại
              </label>
              <input
                id="phoneNo"
                type="tel"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white text-slate-800"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="location">
              Địa chỉ liên hệ
            </label>
            <input
              id="location"
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white text-slate-800"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" isLoading={isUpdating}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
