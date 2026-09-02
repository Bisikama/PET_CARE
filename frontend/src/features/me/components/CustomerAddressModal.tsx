'use client';

import * as React from 'react';
import { X, Loader2, MapPin, ChevronLeft, Navigation, Compass, Plus, Trash2, Edit3, ShieldAlert } from 'lucide-react';
import { useMeStore } from '../stores/me.store';
import { useCustomerAddresses } from '../hooks/useCustomerAddresses';
import { AddressSelector } from './AddressSelector';
import { CustomerAddress, CreateAddressInput } from '../types';

export function CustomerAddressModal() {
  const { isAddressModalOpen, closeAddressModal } = useMeStore();
  const {
    addresses,
    isLoading: isServiceLoading,
    error: apiError,
    createAddress,
    updateAddress,
    deleteAddress,
    fetchAddresses,
  } = useCustomerAddresses();

  // Mode: 'LIST' | 'CREATE' | 'EDIT'
  const [mode, setMode] = React.useState<'LIST' | 'CREATE' | 'EDIT'>('LIST');
  const [editingAddress, setEditingAddress] = React.useState<CustomerAddress | null>(null);

  // Form Fields
  const [label, setLabel] = React.useState('');
  const [receiverName, setReceiverName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [addressLine, setAddressLine] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState<{ province: string; district: string; ward: string } | null>(null);
  const [latitude, setLatitude] = React.useState('');
  const [longitude, setLongitude] = React.useState('');
  const [addressType, setAddressType] = React.useState<'HOME' | 'OFFICE' | 'OTHER'>('OTHER');
  const [isDefault, setIsDefault] = React.useState(false);

  const [locating, setLocating] = React.useState(false);
  const [locatingError, setLocatingError] = React.useState<string | null>(null);
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) closeAddressModal();
    };
    if (isAddressModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isAddressModalOpen, isSubmitting, closeAddressModal]);

  // Sync addresses on mount/open
  React.useEffect(() => {
    if (isAddressModalOpen) {
      fetchAddresses();
      setMode('LIST');
    }
  }, [isAddressModalOpen, fetchAddresses]);

  if (!isAddressModalOpen) return null;

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

  const handleAddressChange = (address: { province: string; district: string; ward: string }) => {
    setSelectedLocation(address);
  };

  const initForm = (address?: CustomerAddress) => {
    setValidationErrors({});
    setLocatingError(null);
    if (address) {
      setEditingAddress(address);
      setLabel(address.label || '');
      setReceiverName(address.receiverName || '');
      setPhone(address.phone || '');
      setAddressLine(address.addressLine);
      setSelectedLocation({
        province: address.city || 'Thành phố Hồ Chí Minh',
        district: address.district || '',
        ward: address.ward || '',
      });
      setLatitude(address.latitude.toString());
      setLongitude(address.longitude.toString());
      setAddressType(address.addressType);
      setIsDefault(address.isDefault);
      setMode('EDIT');
    } else {
      setEditingAddress(null);
      setLabel('Nhà riêng');
      setReceiverName('');
      setPhone('');
      setAddressLine('');
      setSelectedLocation({
        province: 'Thành phố Hồ Chí Minh',
        district: '',
        ward: '',
      });
      setLatitude('');
      setLongitude('');
      setAddressType('HOME');
      setIsDefault(addresses.length === 0); // Default if first address
      setMode('CREATE');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setIsSubmitting(true);

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

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    const formatted = `${addressLine.trim()}, ${selectedLocation!.ward}, ${selectedLocation!.district}, ${selectedLocation!.province}`;

    const inputData: CreateAddressInput = {
      label: label.trim() || 'Địa chỉ',
      receiverName: receiverName.trim() || undefined,
      phone: phone.trim() || undefined,
      addressLine: addressLine.trim(),
      ward: selectedLocation!.ward,
      district: selectedLocation!.district,
      city: selectedLocation!.province,
      latitude: latNum,
      longitude: lngNum,
      formattedAddress: formatted,
      addressType,
      isDefault,
    };

    try {
      if (mode === 'CREATE') {
        await createAddress(inputData);
      } else if (mode === 'EDIT' && editingAddress) {
        await updateAddress(editingAddress.id, inputData);
      }
      setMode('LIST');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        await deleteAddress(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={() => !isSubmitting && closeAddressModal()}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden z-10 transform transition-all duration-300 animate-scale-up flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#031625] px-6 py-5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <h3 className="text-base md:text-lg font-bold tracking-wide">
              {mode === 'LIST' && 'Địa Chỉ Nhận Dịch Vụ'}
              {mode === 'CREATE' && 'Thêm Địa Chỉ Mới'}
              {mode === 'EDIT' && 'Cập Nhật Địa Chỉ'}
            </h3>
          </div>
          {!isSubmitting && (
            <button
              onClick={closeAddressModal}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {apiError && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-100/50 flex items-start gap-2">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          {/* LIST VIEW */}
          {mode === 'LIST' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Danh sách địa chỉ của bạn
                </p>
                <button
                  onClick={() => initForm()}
                  className="inline-flex items-center gap-1 px-3.5 py-2 bg-teal-50 hover:bg-teal-100/80 text-teal-700 text-xs font-extrabold rounded-xl border border-teal-200/40 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm mới
                </button>
              </div>

              {isServiceLoading && addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-400">Đang tải danh sách địa chỉ...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl py-10 text-center">
                  <span className="text-3xl block mb-2">🗺️</span>
                  <h4 className="text-sm font-bold text-slate-700">Chưa có địa chỉ nào</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Vui lòng bấm nút Thêm mới ở trên để thêm địa chỉ nhà để phục vụ chăm sóc tại nhà.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border-2 bg-white flex items-start justify-between gap-4 transition-all ${
                        addr.isDefault
                          ? 'border-[#f0c05a] bg-amber-50/5'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 tracking-wider">
                            {addr.label || 'Địa chỉ'}
                          </span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700 uppercase tracking-wider">
                            {addr.addressType}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-[#f0c05a]/10 text-amber-700 border border-[#f0c05a]/30">
                              Mặc định
                            </span>
                          )}
                        </div>

                        {(addr.receiverName || addr.phone) && (
                          <p className="text-xs font-bold text-slate-700">
                            {[addr.receiverName, addr.phone].filter(Boolean).join(' • ')}
                          </p>
                        )}

                        <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed break-words">
                          {addr.formattedAddress || addr.addressLine}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => initForm(addr)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors cursor-pointer"
                          title="Sửa địa chỉ"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(addr.id)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Xóa địa chỉ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CREATE & EDIT FORM VIEW */}
          {(mode === 'CREATE' || mode === 'EDIT') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector & Label */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Loại địa chỉ
                  </label>
                  <select
                    value={addressType}
                    onChange={(e) => setAddressType(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all"
                  >
                    <option value="HOME">Nhà riêng 🏠</option>
                    <option value="OFFICE">Văn phòng 🏢</option>
                    <option value="OTHER">Khác 📍</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Nhãn (Ví dụ: Nhà nội, Cơ quan)
                  </label>
                  <input
                    type="text"
                    placeholder="Tên gợi nhớ"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all"
                  />
                </div>
              </div>

              {/* Receiver Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Tên người nhận
                  </label>
                  <input
                    type="text"
                    placeholder="Tên khách hàng"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="Số liên hệ"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800"
                  />
                </div>
              </div>

              {/* Address Dropdowns */}
              <div className="space-y-3">
                <AddressSelector
                  onAddressChange={handleAddressChange}
                  initialValues={{
                    province: selectedLocation?.province,
                    district: selectedLocation?.district,
                    ward: selectedLocation?.ward,
                  }}
                />
                {validationErrors.selector && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.selector}</p>
                )}
              </div>

              {/* Address Line Detail */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Số nhà, tên đường (Địa chỉ chi tiết)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ví dụ: 720A Điện Biên Phủ"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-semibold outline-none focus:bg-white focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
                {validationErrors.addressLine && (
                  <p className="text-xs text-rose-500 font-bold pl-1">{validationErrors.addressLine}</p>
                )}
              </div>

              {/* GPS Coordinates Layout */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-teal-600" />
                    Tọa độ GPS định vị (Safe-Pay & Tìm Đối Tác)
                  </span>

                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={locating}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-[0.97] disabled:opacity-50"
                  >
                    {locating ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Đang lấy...
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

              {/* Set as default checkbox */}
              <div className="flex items-center gap-2 pl-1 py-1">
                <input
                  id="isDefault"
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4.5 w-4.5 cursor-pointer"
                />
                <label htmlFor="isDefault" className="text-xs font-bold text-slate-600 cursor-pointer">
                  Đặt địa chỉ này làm mặc định
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('LIST')}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 text-slate-650 hover:bg-slate-50 text-xs md:text-sm font-bold rounded-2xl transition-all duration-150 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Quay lại
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('LIST')}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 text-slate-400 hover:text-slate-600 text-xs md:text-sm font-bold rounded-2xl transition-all duration-150 cursor-pointer"
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
                      'Hoàn thành'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
