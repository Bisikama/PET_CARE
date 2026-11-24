import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { X, Upload, Loader2, User, Phone, Check } from 'lucide-react';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore(state => state.user);
  const { updateProfile, updateAvatar, isLoading, error } = useUpdateProfile();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFile) {
        await updateAvatar(selectedFile);
      }
      
      const payload: { fullName?: string; phone?: string } = {};
      if (fullName !== user?.fullName) payload.fullName = fullName;
      if (phone !== user?.phone) payload.phone = phone;
      
      if (Object.keys(payload).length > 0) {
        await updateProfile(payload);
      }
      
      onClose();
    } catch (err) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-[#08243D] text-white">
          <div>
            <h3 className="text-base font-bold text-white">Cập nhật hồ sơ</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Thay đổi thông tin cá nhân của bạn
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100 flex items-start gap-2">
              <span className="shrink-0">⚠️</span>
              {error}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (user as any)?.avatar || user?.avatarUrl ? (
                  <img src={(user as any)?.avatar || user?.avatarUrl} alt="Current avatar" className="w-full h-full object-cover" />
                ) : (
                  <img src="/images/avatar-customer.png" alt="Current avatar" className="w-full h-full object-cover" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-[#08243D] text-[#F7C948] rounded-full shadow-lg hover:bg-[#0c3254] transition-colors border-2 border-white cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
            />
            <p className="text-xs text-slate-400 font-medium">Chấp nhận JPG, PNG, WEBP (Tối đa 5MB)</p>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#08243D] text-sm font-semibold text-slate-800"
                maxLength={100}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#08243D] text-sm font-semibold text-slate-800"
                maxLength={20}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || (!selectedFile && fullName === user?.fullName && phone === user?.phone)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#08243D] text-[#F7C948] hover:bg-[#0c3254] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
