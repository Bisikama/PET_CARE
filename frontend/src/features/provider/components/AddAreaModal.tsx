'use client';

import * as React from 'react';
import { X, Loader2, MapPin, Check, Plus, Trash2 } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';
import { providerService } from '../services/provider.service';
import { AddressSelector } from '@/features/me/components/AddressSelector';

interface AddAreaModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddAreaModal({ show, onClose, onSuccess }: AddAreaModalProps) {
  const [addressData, setAddressData] = React.useState<{ province: string; district: string; ward: string } | null>(null);
  const [areaList, setAreaList] = React.useState<{ province: string; district: string; ward: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Handle ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    if (show) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [show, isSubmitting, onClose]);

  const handleAddressChange = React.useCallback((address: { province: string; district: string; ward: string }) => {
    setAddressData(address);
  }, []);

  const handleAddAreaToList = () => {
    setValidationError(null);
    if (!addressData || !addressData.province || !addressData.district || !addressData.ward) {
      setValidationError('Vui lòng chọn đầy đủ thông tin Tỉnh/Thành phố, Quận/Huyện, Phường/Xã trước khi thêm.');
      return;
    }

    // Check duplicate
    const exists = areaList.some(
      (a) => a.province === addressData.province && a.district === addressData.district && a.ward === addressData.ward
    );
    if (exists) {
      setValidationError('Khu vực này đã được thêm vào danh sách phía dưới.');
      return;
    }

    setAreaList((prev) => [...prev, addressData]);
  };

  const handleRemoveAreaFromList = (index: number) => {
    setAreaList((prev) => prev.filter((_, i) => i !== index));
  };

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setError(null);

    // If the list is empty, try to use the current selection in AddressSelector
    let finalAreas = [...areaList];
    if (finalAreas.length === 0) {
      if (!addressData || !addressData.province || !addressData.district || !addressData.ward) {
        setValidationError('Vui lòng chọn hoặc thêm ít nhất một khu vực phục vụ.');
        return;
      }
      finalAreas.push(addressData);
    }

    setIsSubmitting(true);
    try {
      // Call API multiple times for all finalAreas
      await Promise.all(
        finalAreas.map((area) =>
          providerService.addServiceArea({
            city: area.province,
            district: area.district,
            ward: area.ward,
          })
        )
      );
      setIsSubmitting(false);
      setAreaList([]); // Reset list
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error adding area:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể thêm khu vực phục vụ.');
      setIsSubmitting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
          onClick={() => !isSubmitting && onClose()}
        />

        {/* Modal Box */}
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 transform animate-scale-up border border-slate-100">
          {/* Header */}
          <div className="bg-[#031625] px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#f0c05a]" />
              <h3 className="text-sm md:text-base font-bold tracking-wide">
                Thêm khu vực phục vụ mới
              </h3>
            </div>
            {!isSubmitting && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <AddressSelector onAddressChange={handleAddressChange} />
              
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddAreaToList}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] border border-indigo-100/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm vào danh sách
                </button>
              </div>
            </div>

            {areaList.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Khu vực chuẩn bị thêm ({areaList.length})
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 border border-slate-100 rounded-2xl scrollbar-none">
                  {areaList.map((area, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-xs font-semibold text-slate-700">
                      <span>{area.ward}, {area.district}, {area.province}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAreaFromList(idx)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {validationError && (
              <p className="text-xs text-rose-500 font-bold pl-1">{validationError}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-650 text-xs font-bold rounded-2xl transition-all cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-[#031625] hover:bg-[#031625]/90 text-[#f0c05a] text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Xác nhận thêm
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
