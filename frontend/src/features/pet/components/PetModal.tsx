'use client';

import * as React from 'react';
import { X, Plus, Camera, Loader2, Info, Save } from 'lucide-react';
import { usePet } from '../hooks/use-pet';

export function PetModal() {
  const { isOpen, isSubmitting, error, closeModal, createPet, updatePet, selectedPet } = usePet();

  // Form states
  const [name, setName] = React.useState('');
  const [species, setSpecies] = React.useState<'Dog' | 'Cat'>('Dog');
  const [breed, setBreed] = React.useState('');
  const [age, setAge] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [gender, setGender] = React.useState<'Male' | 'Female'>('Male');
  const [healthNote, setHealthNote] = React.useState('');
  const [behaviorNote, setBehaviorNote] = React.useState('');

  // Avatar/File states
  const [customFile, setCustomFile] = React.useState<File | null>(null);
  const [customPreview, setCustomPreview] = React.useState<string | null>(null);

  // Validation errors
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync form states with selectedPet for Edit mode
  React.useEffect(() => {
    if (selectedPet) {
      setName(selectedPet.name || '');
      setSpecies(selectedPet.species || 'Dog');
      setBreed(selectedPet.breed || '');
      setAge(selectedPet.age?.toString() || '');
      setWeight(selectedPet.weight?.toString() || '');
      setGender((selectedPet.gender as 'Male' | 'Female') || 'Male');
      setHealthNote(selectedPet.healthNote || '');
      setBehaviorNote(selectedPet.behaviorNote || '');
      setCustomPreview(selectedPet.avatarUrl || null);
    } else {
      setName('');
      setSpecies('Dog');
      setBreed('');
      setAge('');
      setWeight('');
      setGender('Male');
      setHealthNote('');
      setBehaviorNote('');
      setCustomPreview(null);
    }
    setCustomFile(null);
    setValidationErrors({});
  }, [selectedPet, isOpen]);

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setValidationErrors((prev) => ({ ...prev, avatar: 'Định dạng ảnh không hợp lệ (PNG, JPG, WEBP).' }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors((prev) => ({ ...prev, avatar: 'Ảnh quá lớn (tối đa 5MB).' }));
        return;
      }

      setCustomFile(file);
      setCustomPreview(URL.createObjectURL(file));
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy.avatar;
        return copy;
      });
    }
  };

  const triggerCustomFileInput = () => {
    fileInputRef.current?.click();
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Vui lòng nhập tên thú cưng.';

    if (age) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum <= 0) {
        errors.age = 'Độ tuổi phải là số nguyên dương.';
      }
    }

    if (weight) {
      const weightNum = parseFloat(weight);
      if (isNaN(weightNum) || weightNum <= 0) {
        errors.weight = 'Cân nặng phải là số dương.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('species', species);
    
    if (breed.trim()) formData.append('breed', breed.trim());
    if (age) formData.append('age', age);
    if (weight) formData.append('weight', weight);
    formData.append('gender', gender);
    
    if (healthNote.trim()) formData.append('healthNote', healthNote.trim());
    if (behaviorNote.trim()) formData.append('behaviorNote', behaviorNote.trim());

    if (customFile) {
      formData.append('avatar', customFile);
    }

    const success = selectedPet
      ? await updatePet(selectedPet.id, formData)
      : await createPet(formData);

    if (success) {
      // Reset form
      setName('');
      setBreed('');
      setAge('');
      setWeight('');
      setGender('Male');
      setHealthNote('');
      setBehaviorNote('');
      setCustomFile(null);
      setCustomPreview(null);
      setValidationErrors({});
    }
  };

  const isEditMode = !!selectedPet;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={closeModal}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl bg-white rounded-[32px] border border-slate-100 shadow-2xl overflow-hidden z-10 transform transition-all duration-300 animate-scale-up">
        {/* Header */}
        <div className="bg-[#031625] px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">💛</span>
            <h3 className="text-lg font-bold tracking-wide">
              {isEditMode ? 'Cập Nhật Hồ Sơ Thú Cưng' : 'Thêm Hồ Sơ Thú Cưng'}
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* API Error Notification */}
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-sm font-semibold rounded-2xl border border-rose-100">
              {error}
            </div>
          )}

          {/* Avatar Upload Selection */}
          <div className="flex flex-col items-center justify-center space-y-3 pb-2 border-b border-slate-100">
            <div
              onClick={triggerCustomFileInput}
              className={`relative w-24 h-24 rounded-full border-2 border-dashed bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden group transition-all duration-200 outline-none ${
                validationErrors.avatar ? 'border-rose-400 bg-rose-50/10' : 'border-slate-300 hover:border-amber-400 hover:bg-slate-100'
              }`}
            >
              {customPreview ? (
                <img src={customPreview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center text-slate-400 group-hover:text-amber-500 transition-colors">
                  <Camera className="w-8 h-8" />
                  <span className="text-[10px] font-bold mt-1">Tải ảnh lên</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Info className="w-3.5 h-3.5" />
              <span>Hỗ trợ PNG, JPG, WEBP. Tối đa 5MB.</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
            {validationErrors.avatar && (
              <p className="text-xs text-rose-500 font-medium">{validationErrors.avatar}</p>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tên thú cưng */}
            <div className="space-y-1.5">
              <label htmlFor="pet-name" className="block text-sm font-bold text-slate-700">
                Tên thú cưng: *
              </label>
              <input
                id="pet-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Bé Lu, Miu"
                className={`w-full px-4 py-3 rounded-2xl border bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold outline-none transition-all duration-200 ${
                  validationErrors.name ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200' : 'border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-200'
                }`}
              />
              {validationErrors.name && (
                <p className="text-xs text-rose-500 font-medium">{validationErrors.name}</p>
              )}
            </div>

            {/* Loại thú cưng */}
            <div className="space-y-1.5">
              <label htmlFor="pet-species" className="block text-sm font-bold text-slate-700">
                Loại thú cưng: *
              </label>
              <select
                id="pet-species"
                value={species}
                onChange={(e) => setSpecies(e.target.value as 'Dog' | 'Cat')}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all duration-200"
              >
                <option value="Dog">Chó (Dog)</option>
                <option value="Cat">Mèo (Cat)</option>
              </select>
            </div>

            {/* Giống loài */}
            <div className="space-y-1.5">
              <label htmlFor="pet-breed" className="block text-sm font-bold text-slate-700">
                Giống loài:
              </label>
              <input
                id="pet-breed"
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Ví dụ: Poodle, Golden, Mèo Ta"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all duration-200"
              />
            </div>

            {/* Độ tuổi */}
            <div className="space-y-1.5">
              <label htmlFor="pet-age" className="block text-sm font-bold text-slate-700">
                Độ tuổi:
              </label>
              <input
                id="pet-age"
                type="number"
                min="1"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Ví dụ: 3 (tuổi)"
                className={`w-full px-4 py-3 rounded-2xl border bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold outline-none transition-all duration-200 ${
                  validationErrors.age ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200' : 'border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-200'
                }`}
              />
              {validationErrors.age && (
                <p className="text-xs text-rose-500 font-medium">{validationErrors.age}</p>
              )}
            </div>

            {/* Cân nặng */}
            <div className="space-y-1.5">
              <label htmlFor="pet-weight" className="block text-sm font-bold text-slate-700">
                Cân nặng (kg):
              </label>
              <input
                id="pet-weight"
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ví dụ: 4.5"
                className={`w-full px-4 py-3 rounded-2xl border bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold outline-none transition-all duration-200 ${
                  validationErrors.weight ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-200' : 'border-slate-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-200'
                }`}
              />
              {validationErrors.weight && (
                <p className="text-xs text-rose-500 font-medium">{validationErrors.weight}</p>
              )}
            </div>

            {/* Giới tính */}
            <div className="space-y-1.5">
              <label htmlFor="pet-gender" className="block text-sm font-bold text-slate-700">
                Giới tính:
              </label>
              <select
                id="pet-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-semibold outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all duration-200"
              >
                <option value="Male">Đực (Male)</option>
                <option value="Female">Cái (Female)</option>
              </select>
            </div>
          </div>

          {/* Lưu ý sức khỏe */}
          <div className="space-y-1.5">
            <label htmlFor="pet-health" className="block text-sm font-bold text-slate-700">
              Lưu ý sức khỏe:
            </label>
            <textarea
              id="pet-health"
              rows={2}
              value={healthNote}
              onChange={(e) => setHealthNote(e.target.value)}
              placeholder="Ví dụ: Bị dị ứng với thịt gà, viêm tai giữa..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-medium outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all duration-200 resize-none"
            />
          </div>

          {/* Thói quen / Hành vi đặc biệt */}
          <div className="space-y-1.5">
            <label htmlFor="pet-behavior" className="block text-sm font-bold text-slate-700">
              Thói quen / Hành vi đặc biệt:
            </label>
            <textarea
              id="pet-behavior"
              rows={2}
              value={behaviorNote}
              onChange={(e) => setBehaviorNote(e.target.value)}
              placeholder="Ví dụ: Sợ tiếng sấy lớn, thích ăn cỏ mèo, rất quấn người..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-800 text-sm font-medium outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all duration-200 resize-none"
            />
          </div>

          {/* Action buttons footer */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer border border-transparent"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#031625] hover:bg-[#031625]/90 disabled:opacity-50 text-[#f0c05a] text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  {isEditMode ? 'Đang cập nhật...' : 'Đang thêm...'}
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <>
                      <Save className="w-4 h-4" />
                      Cập Nhật
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      Thêm Thú Cưng
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
