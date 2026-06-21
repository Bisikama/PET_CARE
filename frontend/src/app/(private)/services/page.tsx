import { Button } from '@/components/ui/Button';
import { HeartHandshake, Plus, Edit2, CheckCircle2, Clock } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    { id: 1, name: 'Spa & Cắt tỉa lông', description: 'Tắm rửa sạch sẽ, cắt tỉa lông tạo kiểu chuyên nghiệp, cắt móng và vệ sinh tai.', duration: '90 phút', price: '350.000đ', status: 'Hoạt động' },
    { id: 2, name: 'Khám sức khỏe tổng quát', description: 'Khám lâm sàng, xét nghiệm máu cơ bản, tư vấn dinh dưỡng và phòng ngừa giun sán.', duration: '45 phút', price: '200.000đ', status: 'Hoạt động' },
    { id: 3, name: 'Tắm & Sấy khô chuyên sâu', description: 'Tắm bằng dầu gội đặc trị, sấy khô đánh lông rối, làm thơm và chải lông.', duration: '60 phút', price: '150.000đ', status: 'Hoạt động' },
    { id: 4, name: 'Tiêm chủng & Kháng thể', description: 'Tiêm phòng dại, vắc xin 5-trong-1 hoặc 7-trong-1 cho chó mèo định kỳ.', duration: '20 phút', price: '250.000đ', status: 'Hoạt động' },
    { id: 5, name: 'Khách sạn thú cưng', description: 'Dịch vụ trông giữ thú cưng trong phòng điều hòa sạch sẽ, chế độ ăn dinh dưỡng cao.', duration: '24 giờ', price: '300.000đ/ngày', status: 'Hoạt động' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dịch vụ Chăm sóc</h2>
          <p className="text-sm text-slate-400 mt-1">Cấu hình các gói dịch vụ spa, điều trị và trông giữ thú cưng.</p>
        </div>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Thêm dịch vụ
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 className="h-3 w-3" />
                  {service.status}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">{service.name}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{service.description}</p>
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Thời lượng
                  </span>
                  <span className="font-medium text-slate-700">{service.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Đơn giá</span>
                  <span className="font-bold text-teal-600">{service.price}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-9 px-3.5">
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
