import React, { useState } from 'react';
import { useAreas } from '../hooks/useAreas';
import { useAreaActions } from '../hooks/useAreaActions';
import { MapPin, Trash2, Edit2, Check, X } from 'lucide-react';
import { AddressSelector } from '@/features/me/components/AddressSelector';

export const AreaManager = () => {
  const { areas, isLoading, error } = useAreas();
  const { addArea, updateArea, deleteArea } = useAreaActions();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ province: '', district: '', ward: '' });

  const handleAddressChange = React.useCallback((addr: { province: string; district: string; ward: string }) => {
    setFormData(prev => {
      if (prev.province === addr.province && prev.district === addr.district && prev.ward === addr.ward) return prev;
      return addr;
    });
  }, []);

  const handleSave = async () => {
    if (!formData.province || !formData.district) {
      alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố và Quận/Huyện');
      return;
    }
    
    const payload = {
      city: formData.province,
      district: formData.district,
      ward: formData.ward,
    };

    try {
      if (editingId) {
        await updateArea(editingId, payload);
        setEditingId(null);
      } else {
        await addArea(payload);
        setIsAdding(false);
      }
      setFormData({ province: '', district: '', ward: '' });
    } catch (err) {
      alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleEdit = (area: any) => {
    setFormData({ province: area.city, district: area.district, ward: area.ward || '' });
    setEditingId(area.id);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khu vực này?')) {
      try {
        await deleteArea(id);
      } catch (err) {
        alert('Xóa thất bại.');
      }
    }
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ province: '', district: '', ward: '' });
  };

  return (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-[#1a2b3c]">Khu vực hoạt động</h3>
          <p className="text-sm text-slate-500 max-w-sm">
            Quản lý các địa điểm bạn có thể nhận dịch vụ chăm sóc thú cưng.
          </p>
        </div>
        
        {(!isAdding && !editingId) && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex flex-col items-center justify-center gap-1 px-5 py-4 bg-[#f0fbf7] hover:bg-[#e4f7f0] text-[#0f766e] font-bold text-sm rounded-2xl transition-colors shrink-0"
          >
            <span className="text-lg leading-none">+</span>
            <span>Thêm<br/>khu<br/>vực</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-5 animate-in fade-in slide-in-from-top-4">
          <h4 className="font-bold text-slate-800 text-lg">{editingId ? 'Chỉnh sửa khu vực' : 'Thêm khu vực mới'}</h4>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <AddressSelector 
              initialValues={{
                province: formData.province || 'Thành phố Hồ Chí Minh',
                district: formData.district,
                ward: formData.ward
              }}
              onAddressChange={handleAddressChange} 
            />
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <button 
              onClick={cancelEdit}
              className="px-5 py-2.5 flex items-center gap-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              <X size={16} /> Hủy bỏ
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2.5 flex items-center gap-2 text-white bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-500/20 rounded-xl text-sm font-bold transition-colors cursor-pointer"
            >
              <Check size={16} /> {editingId ? 'Cập nhật' : 'Lưu khu vực'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-10 text-slate-500 text-sm font-medium">Đang tải danh sách khu vực...</div>
      ) : error ? (
        <div className="text-center py-10 text-rose-500 text-sm font-medium">{error}</div>
      ) : areas.length === 0 && !isAdding && !editingId ? (
        <div className="text-center py-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
          <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-500">Chưa có khu vực hoạt động nào được thêm.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {areas.map(area => (
            <div key={area.id} className="p-4 bg-white border border-slate-200 hover:border-teal-200 rounded-2xl flex items-center justify-between group transition-all shadow-sm hover:shadow-md cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0fbf7] flex items-center justify-center shrink-0">
                  <MapPin className="text-[#0f766e] w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-sm">
                    {area.district}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">
                    {area.ward ? `${area.ward}, ` : ''}{area.city}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                <button 
                  onClick={() => handleEdit(area)}
                  className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                  title="Chỉnh sửa"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(area.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Xóa"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
