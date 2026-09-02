'use client';

import * as React from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { usePetStore } from '@/features/pet/stores/pet.store';
import { useBookingStore } from '../stores/booking.store';

export function PetSelection() {
  const { user } = useAuthStore();
  const { pets, fetchPets, isLoading, openModal } = usePetStore();
  const { setStep, setSelectedPetId: setStoreSelectedPetId } = useBookingStore();
  const [selectedPetId, setSelectedPetId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  React.useEffect(() => {
    if (pets.length > 0 && !selectedPetId) {
      setSelectedPetId(pets[0].id);
      setStoreSelectedPetId(pets[0].id);
    }
  }, [pets, selectedPetId, setStoreSelectedPetId]);

  const handleSelectPet = (id: string) => {
    setSelectedPetId(id);
    setStoreSelectedPetId(id);
  };

  const displayName = user?.fullName || 'Nguyễn Minh Anh';
  const selectedPet = pets.find((p) => p.id === selectedPetId);

  if (isLoading && pets.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl p-6 md:p-8 flex items-center justify-center min-h-[300px] select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-500">Đang tải danh sách bé cưng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 space-y-8 select-none">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            Hồ Sơ Bé Cưng Của Tôi
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Danh sách các bé cưng được đăng ký dưới tài khoản chủ nuôi {displayName}.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-full border border-slate-200/60 shadow-sm transition-all duration-150 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Đăng ký mới
        </button>
      </div>

      {/* Pet Cards List */}
      {pets.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[24px] py-12 text-center">
          <span className="text-4xl block mb-3">🐶</span>
          <h3 className="text-base font-bold text-slate-800">Chưa có hồ sơ bé cưng nào</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto font-medium">
            Tài khoản của bạn chưa đăng ký bé cưng nào. Vui lòng bấm vào nút "Đăng ký mới" ở trên để tạo hồ sơ.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pets.map((pet) => {
            const isSelected = selectedPetId === pet.id;
            const genderIcon = 
              pet.gender === 'MALE' || pet.gender === 'Đực' ? '♂' : 
              pet.gender === 'FEMALE' || pet.gender === 'Cái' ? '♀' : '';

            return (
              <div
                key={pet.id}
                onClick={() => handleSelectPet(pet.id)}
                className={`relative overflow-hidden rounded-[24px] bg-white p-5 flex items-start gap-4 cursor-pointer transition-all duration-300 border-2 ${
                  isSelected 
                    ? 'border-[#f0c05a] shadow-md bg-amber-50/5' 
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Pet Avatar */}
                <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border border-slate-100 shadow-inner bg-slate-50 flex items-center justify-center">
                  {pet.avatarUrl ? (
                    <img
                      src={pet.avatarUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">
                      {pet.species === 'Dog' || pet.species.toLowerCase() === 'dog' ? '🐶' : '🐱'}
                    </span>
                  )}
                </div>

                {/* Pet Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
                      {pet.name}
                    </h3>
                    <span className="inline-flex text-[9px] font-extrabold px-2 py-0.5 rounded bg-[#eef2ff] text-[#4f46e5] border border-[#e0e7ff] tracking-wider uppercase">
                      {pet.species}
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs md:text-sm font-semibold">
                    {[
                      pet.breed,
                      pet.age ? `${pet.age} tuổi` : null,
                      pet.weight ? `${pet.weight} kg` : null,
                      genderIcon
                    ].filter(Boolean).join(' • ')}
                  </p>

                  {/* Pet Special Note */}
                  {(pet.healthNote || pet.behaviorNote) && (
                    <div className="inline-block p-3.5 bg-amber-50/55 rounded-xl border border-amber-200/20 text-xs font-bold text-amber-700/90 leading-relaxed">
                      {pet.healthNote || pet.behaviorNote}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Alert & Action Bar */}
      {selectedPet && (
        <div className="rounded-2xl bg-[#eef6fc] border border-[#dbeafe]/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed max-w-2xl">
            ✓ Bạn đã chọn bé cưng <strong className="text-slate-900 font-bold">{selectedPet.name}</strong> cho kịch bản chăm sóc tắm cắt tỉa này. Bấm <strong className="text-slate-900 font-bold">Tiếp Tục</strong> để chọn cân nặng và thiết lập nhu cầu đặc biệt.
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-3 bg-[#0a1c2a] hover:bg-[#122e44] text-white text-xs font-bold rounded-2xl shadow transition-all duration-150 cursor-pointer active:scale-[0.98] shrink-0"
          >
            Chọn dịch vụ
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
