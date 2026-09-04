'use client';

import * as React from 'react';
import { X, Loader2, MapPin, ChevronLeft, ChevronRight, Navigation, Info, Compass } from 'lucide-react';
import { useProvider } from '@/features/provider';
import { useProviderAddress } from '../hooks/useProviderAddress';
import { AddressSelector } from './AddressSelector';

export function ProviderAddressModal() {
  const { isOpen, step } = useProvider();
  const { isSubmitting, error, setError, closeModal, setStep, saveBaseAddress } = useProviderAddress();

  const [addressLine, setAddressLine] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<{ province: string; district: string; ward: string } | null>(null);
  const [radius, setRadius] = React.useState('5');
  const [latitude, setLatitude] = React.useState('');
  const [longitude, setLongitude] = React.useState('');

  const [locating, setLocating] = React.useState(false);
  const [locatingError, setLocatingError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) closeModal();
    };
    if (isOpen && step === 2) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, step, isSubmitting, closeModal]);

  if (!isOpen || step !== 2) return null;

  // HTML5 Geolocation API
  const handleGetCurrentLocation = () => {
    setLocating(true);
    setLocatingError(null);
    setValidationErrors((prev) => {
      const copy = { ...prev };
      delete copy.coords;
      return copy;
    });

    if (!navigator.geolocation) {
      setLocatingError('Trình duyệt không hỗ trợ định vị.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocating(false);
      },
      (err) => {
        console.error('Error fetching location:', err);
        let msg = 'Không thể định vị GPS.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Vui lòng cấp quyền truy cập vị trí.';
        }
        setLocatingError(msg);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddressChange = React.useCallback((address: { province: string; district: string; ward: string }) => {
    setSelectedLocation(address);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setError(null);

    const errors: Record<string, string> = {};
    if (!addressLine.trim()) errors.addressLine = 'Vui lòng nhập địa chỉ chi tiết.';
    if (!selectedLocation || !selectedLocation.district || !selectedLocation.ward) {
      errors.selector = 'Vui lòng chọn đầy đủ Quận/Huyện và Phường/Xã.';
    }
    
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      errors.coords = 'Vĩ độ không hợp lệ. Vui lòng định vị.';
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      errors.coords = 'Kinh độ không hợp lệ. Vui lòng định vị.';
    }

    const radNum = parseInt(radius, 10);
    if (isNaN(radNum) || radNum <= 0) {
      errors.radius = 'Bán kính phải là số dương lớn hơn 0.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Auto format: "Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
    const formatted = `${addressLine.trim()}, ${selectedLocation!.ward}, ${selectedLocation!.district}, ${selectedLocation!.province}`;

    const success = await saveBaseAddress({
      baseAddressLine: addressLine.trim(),
      baseLatitude: latNum,
      baseLongitude: lngNum,
      baseFormatted: formatted,
      serviceRadiusKm: radNum,
    });

    if (success) {
      setStep(3); // Go to eKYC step
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={() => !isSubmitting && closeModal()}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden z-10 transform transition-all duration-300 animate-scale-up">
        {/* Header */}
        <div className="bg-[#031625] px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">💼</span>
            <h3 className="text-base md:text-lg font-bold tracking-wide">
              Đăng Ký Đối Tác - Bước 2/3
            </h3>
          </div>
          {!isSubmitting && (
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-6 justify-center">
          {[
            { id: 1, label: 'Thông tin' },
            { id: 2, label: 'Địa chỉ' },
            { id: 3, label: 'Xác minh' },
          ].map((s) => (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => s.id < 2 && setStep(s.id)}
                disabled={isSubmitting || s.id >= 2}
                className="flex items-center gap-1.5 hover:opacity-85 transition-all cursor-pointer outline-none border-none bg-transparent"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  step === s.id ? 'bg-slate-800 text-white shadow-md' :
                  step > s.id ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                <span className={`text-xs font-bold ${
                  step === s.id ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </button>
              {s.id < 3 && <div className="w-12 h-[1px] bg-slate-200" />}
            </React.Fragment>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-sm font-semibold rounded-2xl border border-rose-100">
              {error}
            </div>
          )}

          <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100/30 flex items-start gap-3">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Vui lòng chọn địa chỉ và click nút định vị tự động. Hệ thống sẽ tự động tổng hợp địa chỉ đầy đủ cho hồ sơ của bạn.
            </p>
          </div>

          {/* District / Ward Dropdowns */}
          <div className="space-y-3">
            <AddressSelector onAddressChange={handleAddressChange} />
            {validationErrors.selector && (
              <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.selector}</p>
            )}
          </div>

          {/* Address Line Detail */}
          <div className="space-y-1.5">
            <label htmlFor="addressLine" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Số nhà, tên đường (Địa chỉ chi tiết)
            </label>
            <div className="relative">
              <input
                id="addressLine"
                type="text"
                placeholder="Ví dụ: 720A Điện Biên Phủ"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-850 focus:ring-2 focus:ring-slate-800/10 transition-all duration-205"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            {validationErrors.addressLine && (
              <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.addressLine}</p>
            )}
          </div>

          {/* GPS Coordinates Layout - Redesigned */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-teal-600" />
                Tọa độ GPS định vị cơ sở
              </span>
              
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={locating}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-[0.97] disabled:opacity-50"
              >
                {locating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Đang định vị...
                  </>
                ) : (
                  <>
                    <Navigation className="w-3 h-3 fill-current" />
                    Lấy GPS tự động
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Vĩ độ (Latitude)</span>
                <input
                  type="text"
                  placeholder="Chưa xác định"
                  value={latitude}
                  readOnly
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold outline-none cursor-default"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Kinh độ (Longitude)</span>
                <input
                  type="text"
                  placeholder="Chưa xác định"
                  value={longitude}
                  readOnly
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold outline-none cursor-default"
                />
              </div>
            </div>

            {locatingError && (
              <p className="text-[10px] text-amber-600 font-bold pl-1">
                ⚠️ {locatingError}
              </p>
            )}

            {validationErrors.coords && (
              <p className="text-xs text-rose-500 font-bold pl-1">
                {validationErrors.coords}
              </p>
            )}
          </div>

          {/* Service Radius */}
          <div className="space-y-1.5">
            <label htmlFor="radius" className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Bán kính hoạt động dịch vụ (km)
            </label>
            <input
              id="radius"
              type="number"
              min="1"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-850 focus:ring-2 focus:ring-slate-800/10 transition-all duration-205"
            />
            {validationErrors.radius && (
              <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.radius}</p>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep(1);
              }}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs md:text-sm font-bold rounded-2xl transition-all duration-150 cursor-pointer disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Quay lại
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-slate-400 hover:text-slate-600 text-xs md:text-sm font-bold rounded-2xl transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#031625] hover:bg-[#031625]/90 text-[#f0c05a] text-xs md:text-sm font-bold rounded-2xl shadow-lg flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#f0c05a]" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    Tiếp theo
                    <ChevronRight className="w-4 h-4 text-[#f0c05a]" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
