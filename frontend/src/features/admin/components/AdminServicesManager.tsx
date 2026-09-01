'use client';

import * as React from 'react';
import { Eye, Plus, Sparkles, RefreshCw, HeartHandshake, Tag, Clock, CheckCircle2, XCircle, Edit3, Trash2, Coins, ListChecks, Shield } from 'lucide-react';
import { CreateServiceModal, EditServiceModal, DeleteServiceConfirmModal, ServiceDetailModal, ServicePricingRulesModal, ServiceChecklistTemplatesModal, CancellationPoliciesModal, useServices, Service } from '@/features/services';


export function AdminServicesManager() {
  const { services, isLoading, error, refreshServices } = useServices();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(null);
  const [deletingService, setDeletingService] = React.useState<Service | null>(null);
  const [detailServiceId, setDetailServiceId] = React.useState<string | null>(null);
  const [pricingRulesService, setPricingRulesService] = React.useState<Service | null>(null);
  const [checklistService, setChecklistService] = React.useState<Service | null>(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };


  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-6 h-6 text-teal-600" />
            Quản Lý Gói Dịch Vụ (Admin Services Center)
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Tạo mới, chỉnh sửa thông tin, xóa mềm và cấu hình trạng thái gói dịch vụ trên toàn hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={refreshServices}
            disabled={isLoading}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsPolicyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold border border-blue-200/80 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Shield className="w-4 h-4 text-blue-600" />
            Chính Sách Hủy
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold shadow-lg shadow-teal-500/20 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Tạo Gói Dịch Vụ Mới
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100">
          {error}
        </div>
      )}

      {/* Services List Table / Grid */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Danh sách dịch vụ hiện có ({services.length})
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-teal-600 border-t-transparent animate-spin" />
            <p className="text-xs font-semibold text-slate-400">Đang tải danh sách dịch vụ...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Sparkles className="w-10 h-10 text-teal-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Chưa có gói dịch vụ nào</p>
            <p className="text-xs text-slate-400">Bấm nút "Tạo Gói Dịch Vụ Mới" ở trên để khởi tạo dịch vụ đầu tiên.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {services.map((service) => (
              <div key={service.id} className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-slate-800 text-base">{service.name}</span>
                    <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-[10px] font-extrabold uppercase">
                      {service.category || 'CHUNG'}
                    </span>
                    {service.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-bold border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold border border-slate-200">
                        <XCircle className="w-3 h-3" /> Tạm dừng
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 font-medium line-clamp-1">
                    {service.description || 'Chưa có mô tả chi tiết cho dịch vụ này.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {service.durationMinutes} phút
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      ID: <code className="font-mono text-[10px]">{service.id.slice(0, 8)}...</code>
                    </span>
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                  <div className="text-right pr-2">
                    <span className="text-xs text-slate-400 font-medium block">Giá cơ bản</span>
                    <span className="text-base font-black text-teal-600">{formatCurrency(service.basePrice)}</span>
                  </div>

                  <div className="flex items-center gap-2 border-l border-slate-100 pl-4">
                    {/* Nút Cấu Hình Pricing Rules */}
                    <button
                      onClick={() => setPricingRulesService(service)}
                      className="p-2.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-600 rounded-xl transition-all cursor-pointer active:scale-95"
                      title="Cấu hình bảng giá theo cân nặng"
                    >
                      <Coins className="w-4 h-4" />
                    </button>

                    {/* Nút Cấu Hình Checklist Templates */}
                    <button
                      onClick={() => setChecklistService(service)}
                      className="p-2.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer active:scale-95"
                      title="Cấu hình quy trình checklist thực địa"
                    >
                      <ListChecks className="w-4 h-4" />
                    </button>

                    {/* Nút Xem Chi Tiết (GET /api/services/:id) */}
                    <button
                      onClick={() => setDetailServiceId(service.id)}
                      className="p-2.5 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-600 rounded-xl transition-all cursor-pointer active:scale-95"
                      title="Xem chi tiết dịch vụ"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Nút Chỉnh Sửa (PATCH /api/services/:id) */}
                    <button
                      onClick={() => setEditingService(service)}
                      className="p-2.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer active:scale-95"
                      title="Chỉnh sửa dịch vụ"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Nút Xóa Mềm (DELETE /api/services/:id) */}
                    <button
                      onClick={() => setDeletingService(service)}
                      className="p-2.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl transition-all cursor-pointer active:scale-95"
                      title="Xóa dịch vụ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Component 1: Create Service Modal (POST /api/services) */}
      <CreateServiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshServices}
      />

      {/* Component 2: Edit Service Modal (PATCH /api/services/:id) */}
      <EditServiceModal
        service={editingService}
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        onSuccess={refreshServices}
      />

      {/* Component 3: Delete Service Confirm Modal (DELETE /api/services/:id) */}
      <DeleteServiceConfirmModal
        service={deletingService}
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        onSuccess={refreshServices}
      />

      {/* Component 4: Service Detail Modal (GET /api/services/:id) */}
      <ServiceDetailModal
        serviceId={detailServiceId}
        isOpen={!!detailServiceId}
        onClose={() => setDetailServiceId(null)}
      />

      {/* Component 5: Pricing Rules Modal (GET/POST/PATCH/DELETE Pricing Rules) */}
      <ServicePricingRulesModal
        service={pricingRulesService}
        isOpen={!!pricingRulesService}
        onClose={() => setPricingRulesService(null)}
      />

      {/* Component 6: Checklist Templates Modal (GET/POST/PATCH/DELETE Checklist Templates) */}
      <ServiceChecklistTemplatesModal
        service={checklistService}
        isOpen={!!checklistService}
        onClose={() => setChecklistService(null)}
      />

      {/* Component 7: Cancellation Policies Modal (GET/POST Cancellation Policies) */}
      <CancellationPoliciesModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
      />
    </div>
  );
}

