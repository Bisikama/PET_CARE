import { Button } from '@/components/ui/Button';
import { Dog, Plus, Edit2, Trash2 } from 'lucide-react';

export default function PetsPage() {
  const pets = [
    { id: 1, name: 'Lu Lu', type: 'Chó', breed: 'Golden Retriever', age: '2 tuổi', owner: 'Trần Văn A', weight: '25kg', gender: 'Đực' },
    { id: 2, name: 'Miu Miu', type: 'Mèo', breed: 'Anh lông ngắn', age: '1 tuổi', owner: 'Nguyễn Thị B', weight: '4.5kg', gender: 'Cái' },
    { id: 3, name: 'Ki Ki', type: 'Chó', breed: 'Poodle', age: '3 tuổi', owner: 'Phạm Văn C', weight: '6kg', gender: 'Cái' },
    { id: 4, name: 'Bông Bông', type: 'Mèo', breed: 'Mèo Ba Tư', age: '6 tháng', owner: 'Lê Văn D', weight: '2.8kg', gender: 'Đực' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Thú cưng</h2>
          <p className="text-sm text-slate-400 mt-1">Danh sách thú cưng của khách hàng được quản lý trong hệ thống.</p>
        </div>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Thêm thú cưng
        </Button>
      </div>

      {/* Grid of Pets */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <div key={pet.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Dog className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{pet.name}</h3>
                  <p className="text-xs text-slate-400">{pet.breed} ({pet.type})</p>
                </div>
              </div>
              <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-50 text-slate-600 border border-slate-100`}>
                ID: {pet.id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-slate-50 text-sm">
              <div>
                <span className="text-slate-400 block text-xs">Tuổi</span>
                <span className="font-medium text-slate-700">{pet.age}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Cân nặng</span>
                <span className="font-medium text-slate-700">{pet.weight}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Giới tính</span>
                <span className="font-medium text-slate-700">{pet.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs">Chủ nuôi</span>
                <span className="font-medium text-slate-700">{pet.owner}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" className="h-9 px-3 text-slate-500 hover:text-slate-800">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-9 px-3 text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
