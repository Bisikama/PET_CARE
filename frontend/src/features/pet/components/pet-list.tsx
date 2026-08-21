'use client';

import * as React from 'react';
import { FolderHeart, Plus, Loader2 } from 'lucide-react';
import { usePetStore } from '../stores/pet.store';

export function PetList() {
  const { pets, isLoading, error, fetchPets, openModal } = usePetStore();

  React.useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-500 rounded-2xl">
            <FolderHeart className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
            Bé cưng của tôi ({pets.length})
          </h3>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-all duration-200 active:scale-95 border border-slate-100 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Thêm
        </button>
      </div>

      {/* Loading & Error States */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-sm font-medium">Đang tải danh sách bé cưng...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-rose-500 text-sm font-medium">
          {error}
        </div>
      ) : pets.length === 0 ? (
        /* Empty State */
        <div className="py-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-dashed border-slate-200">
            🐕
          </div>
          <div className="space-y-1">
            <p className="font-bold text-slate-700 text-sm">Chưa có bé cưng nào</p>
            <p className="text-slate-400 text-xs">Hãy thêm hồ sơ bé cưng để trải nghiệm các dịch vụ chăm sóc tốt nhất.</p>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-sm font-bold transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Thêm Ngay
          </button>
        </div>
      ) : (
        /* Pet Cards List */
        <div className="space-y-4">
          {pets.map((pet) => {
            const avatarSrc = pet.avatarUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop&q=80';
            const speciesLabel = pet.species === 'Dog' ? 'CÚN' : 'MÈO';

            return (
              <div
                key={pet.id}
                className="flex items-start gap-4 p-4 md:p-5 bg-slate-50/50 hover:bg-slate-50 rounded-3xl border border-slate-100/80 transition-all duration-300 group"
              >
                {/* Avatar */}
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                  <img
                    src={avatarSrc}
                    alt={pet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-800 text-base md:text-lg truncate">
                      {pet.name}
                    </span>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wider ${
                      pet.species === 'Dog' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {speciesLabel}
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs md:text-sm font-medium">
                    {pet.breed || 'Chưa rõ loài'} • {pet.age ? `${pet.age} tuổi` : 'Chưa rõ tuổi'} • {pet.weight ? `${pet.weight} kg` : 'Chưa rõ cân nặng'}
                  </p>

                  {pet.healthNote && (
                    <div className="inline-block px-3 py-1 bg-amber-50/70 rounded-lg text-amber-700 text-xs font-semibold italic border border-amber-100/30">
                      {pet.healthNote}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
