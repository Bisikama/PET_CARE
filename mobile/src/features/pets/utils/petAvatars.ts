export interface PetAvatarPreset {
  id: string;
  name: string;
  species: 'Dog' | 'Cat';
  uri: string;
}

export const PET_AVATAR_PRESETS: PetAvatarPreset[] = [
  {
    id: 'dog_corgi',
    name: 'Corgi',
    species: 'Dog',
    uri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dog_golden',
    name: 'Golden',
    species: 'Dog',
    uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dog_shiba',
    name: 'Shiba Inu',
    species: 'Dog',
    uri: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dog_poodle',
    name: 'Poodle',
    species: 'Dog',
    uri: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat_ragdoll',
    name: 'Ragdoll',
    species: 'Cat',
    uri: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat_british',
    name: 'Mèo Anh',
    species: 'Cat',
    uri: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat_tabby',
    name: 'Mèo Vàng',
    species: 'Cat',
    uri: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'cat_siamese',
    name: 'Xiêm / Calico',
    species: 'Cat',
    uri: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80',
  },
];

/**
 * Lấy avatar hiển thị cho thú cưng.
 * Nếu đã có ảnh thật upload (avatarUrl / avatar_url), dùng ngay.
 * Nếu chưa có, trả về ảnh mẫu chuẩn chất lượng cao theo giống loài/tên để giao diện luôn lung linh.
 */
export function getPetAvatar(pet?: {
  avatarUrl?: string | null;
  avatar_url?: string | null;
  species?: string | null;
  name?: string | null;
}): string {
  if (pet?.avatarUrl && pet.avatarUrl.trim().length > 0) {
    return pet.avatarUrl;
  }
  if (pet?.avatar_url && pet.avatar_url.trim().length > 0) {
    return pet.avatar_url;
  }

  const isCat = (pet?.species || '').toLowerCase() === 'cat';
  const presets = isCat
    ? PET_AVATAR_PRESETS.filter((p) => p.species === 'Cat')
    : PET_AVATAR_PRESETS.filter((p) => p.species === 'Dog');

  // Chọn ảnh mẫu dựa trên hash tên thú cưng để cố định cho từng bé
  const name = pet?.name || 'Pet';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) % presets.length;
  }

  return presets[hash]?.uri || presets[0].uri;
}
