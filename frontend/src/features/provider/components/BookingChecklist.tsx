import React, { useState } from 'react';
import { CheckCircle2, UploadCloud, Camera, CheckSquare, Layers, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUpdateChecklist } from '../hooks/useUpdateChecklist';
import { ProviderBookingDetail } from '../types/booking';

interface BookingChecklistProps {
  bookingId: string;
  bookingDetail: ProviderBookingDetail;
  onRefresh: () => void;
}

export const BookingChecklist: React.FC<BookingChecklistProps> = ({ bookingId, bookingDetail, onRefresh }) => {
  const { updateChecklistItem, isUpdating } = useUpdateChecklist();
  const [isCompleting, setIsCompleting] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Extract checklist items grouped by service
  const checklistGroups: { serviceName: string, items: any[] }[] = [];
  let totalItems = 0;
  let completedItems = 0;
  let globalStepIndex = 1;

  bookingDetail.booking_pets?.forEach(pet => {
    pet.booking_services?.forEach(service => {
      if (service.booking_checklist_items && service.booking_checklist_items.length > 0) {
        const sortedItems = service.booking_checklist_items;
        
        // Assign global step index to maintain 1 to N sequence
        const itemsWithIndex = sortedItems.map(item => ({
          ...item,
          stepIndex: globalStepIndex++
        }));

        totalItems += itemsWithIndex.length;
        completedItems += itemsWithIndex.filter(item => item.status === 'DONE').length;

        checklistGroups.push({
          serviceName: service.service_name,
          items: itemsWithIndex
        });
      }
    });
  });

  const isAllCompleted = totalItems > 0 && completedItems === totalItems;
  const isUploadValid = uploadedMedia !== null;
  const canComplete = isAllCompleted && isUploadValid;

  const handleComplete = async () => {
    if (!canComplete || isCompleting) return;
    setIsCompleting(true);
    try {
      const { providerBookingService } = await import('../services/provider-booking.service');
      await providerBookingService.completeBooking(bookingId, {
        evidenceMedias: [
          {
            mediaUrl: uploadedMedia,
            mediaType: 'IMAGE',
            caption: 'Ảnh nghiệm thu hoàn tất'
          }
        ]
      });
      onRefresh();
    } catch (error: any) {
      console.error('Failed to complete booking:', error);
      alert(error.response?.data?.message || 'Không thể hoàn tất. Vui lòng thử lại.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleToggle = (itemId: string, currentStatus: string) => {
    if (isUpdating[itemId]) return;
    const newStatus = currentStatus === 'DONE' ? 'PENDING' : 'DONE';
    updateChecklistItem(bookingId, itemId, newStatus, onRefresh);
  };

  if (totalItems === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-8 flex flex-col items-center justify-center text-center">
        <CheckSquare className="w-12 h-12 text-gray-300 mb-3" />
        <h3 className="text-gray-900 font-bold">Không có Checklist</h3>
        <p className="text-gray-500 text-sm mt-1">Dịch vụ này không yêu cầu checklist nghiệm thu.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 mt-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-gray-100 gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-7 h-7 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-lg uppercase tracking-wide">
            Checklist {totalItems} Bước Nghiệm Thu
          </h3>
        </div>
        <div className="text-blue-600 font-bold bg-blue-50 px-4 py-1.5 rounded-full text-sm shrink-0 text-center">
          {completedItems}/{totalItems} hoàn thành
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-gray-100">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 rounded-r-full"
          style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
        ></div>
      </div>

      {/* Checklist Items Grouped By Service */}
      <div className="p-6">
        <div className="space-y-8">
          {checklistGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-4">
              {/* Service Category Header */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <Layers className="w-5 h-5 text-indigo-500" />
                <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wider">{group.serviceName}</h4>
              </div>

              {/* Items in this Service */}
              <div className="space-y-3 pl-2">
                {group.items.map((item) => {
                  const isDone = item.status === 'DONE';
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => handleToggle(item.id, item.status)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none
                        ${isDone 
                          ? 'border-green-200 bg-green-50/50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                        }
                        ${isUpdating[item.id] ? 'opacity-50 pointer-events-none' : ''}
                      `}
                    >
                      {/* Checkbox Icon */}
                      <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors
                        ${isDone ? 'bg-green-500' : 'border-2 border-gray-300'}
                      `}>
                        {isDone && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <p className={`text-[11px] font-bold mb-0.5 uppercase tracking-wide ${isDone ? 'text-green-600/70' : 'text-gray-400'}`}>
                          Bước {item.stepIndex}
                        </p>
                        <p className={`font-semibold text-sm ${isDone ? 'text-gray-500 line-through decoration-gray-400' : 'text-gray-800'}`}>
                          {item.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Upload Media Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-gray-900">Ảnh Nghiệm Thu Thực Tế (Bắt buộc ít nhất 1 ảnh)</h4>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                // TODO: Upload to server, for now just use local blob for preview
                setIsUploading(true);
                setTimeout(() => {
                  setUploadedMedia(URL.createObjectURL(file));
                  setIsUploading(false);
                }, 1000);
              }
            }}
          />

          {!uploadedMedia ? (
            <div 
              className={`border-2 border-dashed border-indigo-200 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${isUploading ? 'bg-indigo-50/70 opacity-50' : 'bg-indigo-50/30 hover:bg-indigo-50/70'}`}
              onClick={() => {
                if (!isUploading) fileInputRef.current?.click();
              }}
            >
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-3" />
              ) : (
                <UploadCloud className="w-10 h-10 text-indigo-400 group-hover:text-indigo-600 mb-3 transition-colors" />
              )}
              <p className="font-bold text-gray-700 mb-1">{isUploading ? 'Đang tải ảnh lên...' : 'Kéo & thả ảnh nghiệm thu vào đây hoặc click để chọn'}</p>
              <p className="text-sm text-gray-500 mb-4">Định dạng JPG, PNG dưới 5MB</p>
              <Button 
                type="button"
                variant="outline" 
                disabled={isUploading}
                className="bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-100 font-bold flex gap-2 items-center shadow-sm pointer-events-none"
              >
                <Camera className="w-4 h-4" /> Chọn Ảnh
              </Button>
            </div>
          ) : (
            <div className="relative w-48 h-48 rounded-xl overflow-hidden border-2 border-green-400 shadow-sm">
              <img src={uploadedMedia} alt="Ảnh nghiệm thu" className={`w-full h-full object-cover ${isUploading ? 'opacity-50 blur-sm' : ''}`} />
              <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                {isUploading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedMedia(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-500/80 hover:bg-red-500 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm transition-all"
              >
                Xóa ảnh
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button 
          className="w-full sm:w-auto bg-[#001b3a] hover:bg-[#001026] text-white font-bold py-3.5 px-8 rounded-full flex items-center justify-center gap-2 uppercase tracking-wide shadow-md transition-all active:scale-95"
          disabled={!canComplete || isCompleting}
          onClick={handleComplete}
        >
          {isCompleting ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-yellow-400" />
          )}
          Gửi yêu cầu nghiệm thu
        </Button>
        {!canComplete && (
          <p className="text-sm text-gray-500 font-medium">
            * Cần hoàn thành <span className="font-bold text-gray-700">{totalItems}/{totalItems} checklist</span> & tải lên <span className="font-bold text-gray-700">1 ảnh</span>.
          </p>
        )}
      </div>
    </div>
  );
};
