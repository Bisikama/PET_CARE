'use client';

import * as React from 'react';
import { FolderHeart, Plus } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: 'MÈO' | 'CÚN';
  breed: string;
  age: number;
  weight: number;
  note: string;
  avatar: string;
}

const mockPets: Pet[] = [
  {
    id: '1',
    name: 'Miu Miu',
    type: 'MÈO',
    breed: 'Mèo Anh lông ngắn',
    age: 2,
    weight: 4.2,
    note: 'Lưu ý: Hơi nhát, sợ tiếng động...',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Củ Đậu (Lu)',
    type: 'CÚN',
    breed: 'Poodle',
    age: 1,
    weight: 3.5,
    note: 'Lưu ý: Rất năng động và thè...',
    avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop&q=80',
  },
];

export function PetList() {
  // Vì chưa có API nên hiện tại dùng mockPets
  const [pets] = React.useState<Pet[]>(mockPets);

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
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-all duration-200 active:scale-95 border border-slate-100">
          <Plus className="w-4 h-4" />
          Thêm
        </button>
      </div>

      {/* Pet Cards List */}
      <div className="space-y-4">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="flex items-start gap-4 p-4 md:p-5 bg-slate-50/50 hover:bg-slate-50 rounded-3xl border border-slate-100/80 transition-all duration-300 group"
          >
            {/* Avatar */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
              <img
                src={pet.avatar}
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
                <span className="inline-flex px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold tracking-wider">
                  {pet.type}
                </span>
              </div>

              <p className="text-slate-500 text-xs md:text-sm font-medium">
                {pet.breed} • {pet.age} tuổi • {pet.weight} kg
              </p>

              {pet.note && (
                <div className="inline-block px-3 py-1 bg-amber-50/70 rounded-lg text-amber-700 text-xs font-semibold italic border border-amber-100/30">
                  {pet.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
