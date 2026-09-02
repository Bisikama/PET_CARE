'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ListChecks,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Save,
  RotateCcw,
  ListOrdered,
  FileText
} from 'lucide-react';
import { useChecklistTemplates } from '../hooks/useChecklistTemplates';
import { Service, ChecklistTemplate, CreateChecklistTemplateData, UpdateChecklistTemplateData } from '../types';

interface ServiceChecklistTemplatesModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceChecklistTemplatesModal: React.FC<ServiceChecklistTemplatesModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const [mounted, setMounted] = React.useState(false);
  const {
    checklistTemplates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useChecklistTemplates(isOpen && service ? service.id : null);

  const [editingTemplate, setEditingTemplate] = React.useState<ChecklistTemplate | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<{
    title: string;
    description: string;
    isRequired: boolean;
    sortOrder: string;
  }>({
    title: '',
    description: '',
    isRequired: true,
    sortOrder: '1',
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Reset or pre-fill form when editingTemplate or checklistTemplates change
  React.useEffect(() => {
    if (editingTemplate) {
      setFormData({
        title: editingTemplate.title || '',
        description: editingTemplate.description || '',
        isRequired: editingTemplate.isRequired ?? true,
        sortOrder: String(editingTemplate.sortOrder ?? 1),
      });
    } else {
      const nextSortOrder = (checklistTemplates.length || 0) + 1;
      setFormData({
        title: '',
        description: '',
        isRequired: true,
        sortOrder: String(nextSortOrder),
      });
    }
    setFormError(null);
  }, [editingTemplate, checklistTemplates.length, isOpen]);

  if (!mounted || !isOpen || !service) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setFormError(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Vui lòng nhập tiêu đề đầu việc checklist.');
      return;
    }

    const sortOrderNum = Number(formData.sortOrder) || 0;

    setSubmitting(true);
    try {
      if (editingTemplate) {
        // PATCH /api/services/checklist-templates/{templateId}
        const updatePayload: UpdateChecklistTemplateData = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          isRequired: formData.isRequired,
          sortOrder: sortOrderNum,
        };
        await updateTemplate(editingTemplate.id, updatePayload);
        setEditingTemplate(null);
      } else {
        // POST /api/services/{id}/checklist-templates
        const createPayload: CreateChecklistTemplateData = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          isRequired: formData.isRequired,
          sortOrder: sortOrderNum,
        };
        await createTemplate(createPayload);
      }
    } catch (err: any) {
      setFormError(err.message || 'Không thể lưu đầu việc checklist.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId);
      if (editingTemplate?.id === templateId) {
        setEditingTemplate(null);
      }
      setDeletingTemplateId(null);
    } catch (err: any) {
      setFormError(err.message || 'Không thể xóa đầu việc checklist này.');
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[88vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-[#0c0e25] pt-7 pb-6 px-7 text-white flex items-center justify-between border-b border-indigo-900/60 shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10 min-w-0 pr-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-inner">
              <ListChecks className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0">
              <h3 className="text-xl font-black tracking-tight text-white truncate">
                Quy Trình Kiểm Tra Thực Địa (Checklist Templates)
              </h3>
              <p className="text-xs text-indigo-200/80 font-medium leading-normal truncate">
                Cấu hình danh sách kiểm tra từng bước cho dịch vụ <span className="text-indigo-300 font-bold">{service.name}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-9 h-9 flex items-center justify-center text-indigo-300 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-7 space-y-6">
          {(error || formError) && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-semibold rounded-2xl border border-rose-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{formError || error}</span>
            </div>
          )}

          {/* Form to Add or Edit Checklist Template */}
          <form onSubmit={handleSubmitForm} className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-200/60 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                {editingTemplate ? <Edit3 className="w-4 h-4 text-indigo-600" /> : <Plus className="w-4 h-4 text-indigo-600" />}
                {editingTemplate ? `Chỉnh sửa bước (ID: ${editingTemplate.id.slice(0, 8)}...)` : 'Thêm bước kiểm tra mới'}
              </h4>

              {editingTemplate && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Hủy sửa
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Title */}
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Tên/Tiêu đề đầu việc <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="VD: Kiểm tra tình trạng da và lông thú cưng..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <ListOrdered className="w-3 h-3 text-slate-500" /> Thứ tự
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  min="0"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 text-center"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" /> Mô tả chi tiết đầu việc (hướng dẫn cho Provider)
              </label>
              <textarea
                name="description"
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="VD: Chụp hình góc trước và sau khi làm dịch vụ, kiểm tra vết thương hở..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Toggle Required & Submit Button */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRequired"
                  checked={formData.isRequired}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700">Đầu việc bắt buộc thực hiện (Required)</span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang lưu...
                  </>
                ) : editingTemplate ? (
                  <>
                    <Save className="w-3.5 h-3.5" /> Lưu Cập Nhật
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Thêm Bước Checklist
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Checklist Templates List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Quy trình checklist hiện có ({checklistTemplates.length})
              </h4>
            </div>

            {isLoading && checklistTemplates.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-400">Đang tải danh sách quy trình checklist...</p>
              </div>
            ) : checklistTemplates.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <ListChecks className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Chưa có bước checklist nào</p>
                <p className="text-[11px] text-slate-400">Tạo bước kiểm tra đầu tiên ở biểu mẫu trên để áp dụng quy trình chuẩn cho đối tác.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {checklistTemplates.map((template, idx) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                      editingTemplate?.id === template.id
                        ? 'bg-indigo-50/70 border-indigo-200'
                        : 'bg-white border-slate-200 hover:border-indigo-100 shadow-sm'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-black flex items-center justify-center shrink-0 text-xs shadow-inner">
                      {template.sortOrder || idx + 1}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-800 text-sm">{template.title}</span>
                        {template.isRequired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-[10px] font-bold border border-rose-100">
                            Bắt buộc
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold border border-slate-200">
                            Tùy chọn
                          </span>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{template.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    {deletingTemplateId === template.id ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => confirmDeleteTemplate(template.id)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-extrabold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                          Xóa
                        </button>
                        <button
                          onClick={() => setDeletingTemplateId(null)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setEditingTemplate(template)}
                          className="p-1.5 hover:bg-indigo-100/80 text-indigo-700 rounded-lg transition-all cursor-pointer"
                          title="Chỉnh sửa bước"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingTemplateId(template.id)}
                          className="p-1.5 hover:bg-rose-100/80 text-rose-600 rounded-lg transition-all cursor-pointer"
                          title="Xóa bước"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 md:p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Đóng Cấu Hình
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
