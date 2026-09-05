import React, { useState } from 'react';
import { Compass, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStartService } from '../hooks/useStartService';

interface BookingGPSCheckInProps {
  bookingId: string;
  suggestedLat?: string | number;
  suggestedLng?: string | number;
  suggestedPlaceName?: string;
  onCheckInSuccess: () => void;
}

export const BookingGPSCheckIn: React.FC<BookingGPSCheckInProps> = ({
  bookingId,
  suggestedLat,
  suggestedLng,
  suggestedPlaceName,
  onCheckInSuccess
}) => {
  const { startService, isStarting } = useStartService();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleCheckIn = () => {
    setIsGettingLocation(true);
    
    // Yêu cầu quyền truy cập định vị từ trình duyệt
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsGettingLocation(false);
          // Đã lấy được tọa độ (position.coords.latitude, position.coords.longitude)
          // Tiến hành gọi API startService
          startService(bookingId, onCheckInSuccess);
        },
        (error) => {
          setIsGettingLocation(false);
          console.error("Lỗi lấy định vị:", error);
          alert('Không thể lấy được vị trí GPS. Vui lòng cho phép quyền truy cập vị trí trên trình duyệt của bạn.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsGettingLocation(false);
      alert('Trình duyệt của bạn không hỗ trợ định vị GPS.');
    }
  };

  return (
    <div className="bg-indigo-50/50 border border-indigo-200 border-dashed rounded-2xl p-6 relative overflow-hidden mt-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Compass className="w-32 h-32" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4 border-b border-indigo-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-indigo-900 text-lg uppercase tracking-wide">
            Định vị Check-in GPS tại gia
          </h3>
        </div>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded uppercase tracking-wider">
          Yêu cầu bắt buộc
        </span>
      </div>

      <div className="relative z-10 mb-6">
        <p className="text-indigo-800 font-medium">
          Để kích hoạt checklist chăm sóc và bắt đầu tính giờ làm việc, vui lòng di chuyển tới địa chỉ nhà khách hàng và bấm <strong>Check-In</strong> để ghi nhận định vị chuẩn xác của bạn.
        </p>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
        <Button 
          className="w-full sm:w-auto bg-[#5D5FEF] hover:bg-[#4b4ce0] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all active:scale-95"
          onClick={handleCheckIn}
          disabled={isStarting || isGettingLocation}
        >
          <MapPin className="w-5 h-5" /> 
          {isGettingLocation ? 'Đang lấy tọa độ...' : isStarting ? 'Đang xử lý...' : 'Xác nhận Check-in tọa độ GPS'}
        </Button>
        
        {suggestedLat && suggestedLng && (
          <div className="flex items-center gap-2 text-indigo-600 text-sm mt-2 sm:mt-0">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Tọa độ gợi ý: <span className="font-semibold underline decoration-indigo-300 decoration-dashed">{suggestedLat}° N, {suggestedLng}° E</span> {suggestedPlaceName && `(${suggestedPlaceName})`}</span>
          </div>
        )}
      </div>
    </div>
  );
};
