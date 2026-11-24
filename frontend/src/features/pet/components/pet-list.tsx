'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FolderHeart, Plus, Loader2, Pencil, Trash2, FileText, CalendarPlus } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { useBookingStore } from '@/features/booking/stores/booking.store';
import { usePet } from '../hooks/use-pet';
import { PetMedicalRecordModal } from './PetMedicalRecordModal';
import { systemConfirm } from '@/components/ui/SystemDialogProvider';

export function PetList() {
  const router = useRouter();
  const { setSelectedPetId } = useBookingStore();
  const { pets, isLoading, error, fetchPets, openModal, setSelectedPet, deletePet } = usePet();
  const [medicalRecordPet, setMedicalRecordPet] = React.useState<{ id: string; name: string } | null>(null);

  React.useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/70 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#08243D] text-[#F7C948] flex items-center justify-center shrink-0">
            <FolderHeart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#08243D]">
              Thú cưng của tôi ({pets.length})
            </h3>
            <p className="text-xs text-slate-400">Hồ sơ thông tin & sổ y tế</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedPet(null);
            openModal();
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08243D] hover:bg-[#0c3254] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#F7C948]" />
          Thêm thú cưng
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-[#08243D]" />
          <p className="text-xs font-medium">Đang tải danh sách thú cưng...</p>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-rose-600 text-xs font-medium">
          {error}
        </div>
      ) : pets.length === 0 ? (
        /* Empty State */
        <div className="py-12 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <p className="font-bold text-slate-700 text-sm">Chưa có hồ sơ thú cưng nào</p>
          <p className="text-slate-400 text-xs max-w-xs mx-auto">
            Thêm hồ sơ thú cưng để đặt lịch chăm sóc tại nhà nhanh chóng hơn.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedPet(null);
              openModal();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#08243D] text-[#F7C948] text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm ngay
          </button>
        </div>
      ) : (
        /* Pet Cards List */
        <div className="divide-y divide-slate-100">
          {pets.map((pet) => {
            const avatarSrc = pet.avatarUrl || '/images/avatar-pet.png';
            const isDog = pet.species === 'Dog';
            const speciesLabel = isDog ? 'Cún' : 'Mèo';

            return (
              <div
                key={pet.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Avatar */}
                  <div className="w-15 h-15 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/70 shrink-0">
                    <img
                      src={avatarSrc}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#08243D] text-base truncate">
                        {pet.name}
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                        {speciesLabel}
                      </span>
                    </div>

                    <p className="text-slate-500 text-xs font-medium">
                      {pet.breed || 'Chưa rõ giống'} · {pet.age ? `${pet.age} tuổi` : 'Chưa rõ tuổi'} · {pet.weight ? `${pet.weight} kg` : 'Chưa rõ cân nặng'}
                    </p>

                    {(pet.healthNote || pet.behaviorNote) && (
                      <p className="text-slate-400 text-xs truncate max-w-md">
                        {[pet.healthNote && `Sức khỏe: ${pet.healthNote}`, pet.behaviorNote && `Thói quen: ${pet.behaviorNote}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPetId(pet.id);
                      router.push(`${ROUTES.BOOKINGS}?view=new`);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-[#08243D] hover:bg-[#0c3254] text-[#F7C948] transition-colors cursor-pointer"
                    title="Đặt lịch chăm sóc cho bé này"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    Đặt lịch
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedicalRecordPet({ id: pet.id, name: pet.name })}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70 transition-colors cursor-pointer"
                    title="Sổ y tế"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Sổ y tế
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPet(pet);
                      openModal();
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200/70 transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await systemConfirm({
                        title: `Xóa hồ sơ ${pet.name}?`,
                        message: `Bạn có chắc chắn muốn xóa hồ sơ bé ${pet.name} không? Dữ liệu lịch sử đã đặt vẫn được bảo lưu.`,
                        confirmText: 'Xóa hồ sơ',
                        cancelText: 'Hủy bỏ',
                        variant: 'danger',
                      });
                      if (ok) {
                        await deletePet(pet.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/70 transition-colors cursor-pointer"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pet Medical Record Modal */}
      {medicalRecordPet && (
        <PetMedicalRecordModal
          petId={medicalRecordPet.id}
          petName={medicalRecordPet.name}
          isOpen={!!medicalRecordPet}
          onClose={() => setMedicalRecordPet(null)}
        />
      )}
    </div>
  );
}




