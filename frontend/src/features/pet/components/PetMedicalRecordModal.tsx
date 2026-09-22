'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  FileText,
  Pencil,
  Trash2,
  Loader2,
  Syringe,
  Stethoscope,
  AlertTriangle,
  ShieldAlert,
  List,
  CheckCircle2,
} from 'lucide-react';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { MedicalRecordType, PetMedicalRecord } from '../types/medical-record.types';

interface PetMedicalRecordModalProps {
  petId: string;
  petName: string;
  isOpen: boolean;
  onClose: () => void;
}

const RECORD_TYPES: {
  label: string;
  value: MedicalRecordType;
  description: string;
  badgeClass: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    label: 'Tiêm phòng (Vaccine)',
    value: 'VACCINE',
    description: 'Vắc xin phòng bệnh, dại, 5 bệnh, 7 bệnh...',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: Syringe,
  },
  {
    label: 'Phẫu thuật & Điều trị (Surgery)',
    value: 'SURGERY',
    description: 'Triệt sản, phẫu thuật, can thiệp y tế...',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Stethoscope,
  },
  {
    label: 'Tiền sử Dị ứng (Allergy)',
    value: 'ALLERGY',
    description: 'Dị ứng thức ăn, thuốc, phấn hoa, côn trùng...',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    icon: AlertTriangle,
  },
];

export const PetMedicalRecordModal: React.FC<PetMedicalRecordModalProps> = ({
  petId,
  petName,
  isOpen,
  onClose,
}) => {
  const {
    records,
    isLoading,
    isSubmitting,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
  } = useMedicalRecords(isOpen ? petId : undefined);

  const [editingRecord, setEditingRecord] = useState<PetMedicalRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [recordType, setRecordType] = useState<MedicalRecordType>('VACCINE');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (editingRecord) {
      setRecordType(editingRecord.recordType);
      setDescription(editingRecord.description);
      setDate(editingRecord.date ? new Date(editingRecord.date).toISOString().split('T')[0] : '');
      setShowForm(true);
    } else {
      setRecordType('VACCINE');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setShowForm(false);
    }
  }, [editingRecord]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    if (editingRecord) {
      const ok = await updateRecord(editingRecord.id, {
        recordType,
        description,
        date: new Date(date).toISOString(),
      });
      if (ok) {
        setEditingRecord(null);
        setShowForm(false);
      }
    } else {
      const ok = await createRecord({
        recordType,
        description,
        date: new Date(date).toISOString(),
      });
      if (ok) {
        setShowForm(false);
        setDescription('');
      }
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteRecord(id);
    setDeletingId(null);
  };

  const getTypeMeta = (type: MedicalRecordType) => {
    return (
      RECORD_TYPES.find((t) => t.value === type) || {
        label: type,
        badgeClass: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
        icon: FileText,
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 md:p-8 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 transition-all">
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Sổ Y Tế Thú Cưng
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Hồ sơ sức khỏe cho <span className="font-semibold text-emerald-600 dark:text-emerald-400">{petName}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Controls / View Mode Switcher */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {showForm ? (editingRecord ? 'Cập Nhật Hồ Sơ' : 'Thêm Hồ Sơ Mới') : 'Lịch Sử Sức Khỏe'}
            </span>
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {records.length} bản ghi
            </span>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setEditingRecord(null);
              } else {
                setEditingRecord(null);
                setShowForm(true);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all"
          >
            {showForm ? (
              <>
                <List className="h-4 w-4" />
                Xem Danh Sách
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Thêm Hồ Sơ Y Tế
              </>
            )}
          </button>
        </div>

        {/* Content Body */}
        {showForm ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Record Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Loại hồ sơ y tế
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {RECORD_TYPES.map((t) => {
                  const IconComponent = t.icon;
                  const isSelected = recordType === t.value;
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setRecordType(t.value)}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-xs">
                        <IconComponent className="h-4 w-4 shrink-0" />
                        {t.label.split(' ')[0]} {t.label.split(' ')[1]}
                      </div>
                      <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {t.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Ngày thực hiện / Ngày khám
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800 transition-all"
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Mô tả chi tiết / Ghi chú y tế
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
                placeholder="Ví dụ: Tiêm phòng dại định kỳ 7 trong 1, phản ứng nhẹ sau tiêm..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:bg-slate-800 transition-all"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 shadow-md shadow-emerald-600/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {editingRecord ? 'Cập Nhật Hồ Sơ' : 'Lưu Hồ Sơ'}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Record List View */
          <div className="mt-5 max-h-[380px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-500" />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Đang tải hồ sơ y tế...
                </p>
              </div>
            ) : records.length === 0 ? (
              <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <FileText className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" />
                <h4 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Chưa có hồ sơ y tế
                </h4>
                <p className="mt-1 text-xs text-slate-400">
                  Bấm "Thêm Hồ Sơ Y Tế" để lưu lịch sử tiêm phòng, dị ứng hoặc phẫu thuật.
                </p>
              </div>
            ) : (
              records.map((rec) => {
                const meta = getTypeMeta(rec.recordType);
                const IconComponent = meta.icon;
                const isDeleting = deletingId === rec.id;

                return (
                  <div
                    key={rec.id}
                    className="group relative flex items-start justify-between rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-800/50 transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <IconComponent className="h-4 w-4" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <Calendar className="h-3 w-3" />
                            {new Date(rec.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                          {rec.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingRecord(rec)}
                        title="Chỉnh sửa"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-700 dark:hover:text-emerald-400 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        disabled={isDeleting}
                        title="Xóa hồ sơ"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
