'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search } from 'lucide-react';
import { useVietNamProvinces } from '../hooks/useVietNamProvinces';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Validation Schema
const addressValidationSchema = z.object({
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  ward: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
});

type AddressFormData = z.infer<typeof addressValidationSchema>;

interface AddressSelectorProps {
  onAddressChange: (address: { province: string; district: string; ward: string }) => void;
  initialValues?: {
    province?: string;
    district?: string;
    ward?: string;
  };
}

export function AddressSelector({ onAddressChange, initialValues }: AddressSelectorProps) {
  const { provinces, isLoading, getDistrictsOf, getWardsOf } = useVietNamProvinces();

  const [provinceSearch, setProvinceSearch] = React.useState('');
  const [districtSearch, setDistrictSearch] = React.useState('');
  const [wardSearch, setWardSearch] = React.useState('');

  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressValidationSchema),
    defaultValues: {
      province: initialValues?.province || 'Thành phố Hồ Chí Minh',
      district: initialValues?.district || '',
      ward: initialValues?.ward || '',
    },
  });

  // Watch fields to trigger updates dynamically
  const selectedProvince = watch('province');
  const selectedDistrict = watch('district');
  const selectedWard = watch('ward');

  // Trigger onAddressChange when all three parts of the address are chosen
  React.useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      onAddressChange({
        province: selectedProvince,
        district: selectedDistrict,
        ward: selectedWard,
      });
    }
  }, [selectedProvince, selectedDistrict, selectedWard, onAddressChange]);

  // Load lists
  const districts = React.useMemo(() => getDistrictsOf(selectedProvince), [selectedProvince, getDistrictsOf]);
  const wards = React.useMemo(() => getWardsOf(selectedProvince, selectedDistrict), [selectedProvince, selectedDistrict, getWardsOf]);

  // Filtered lists for search boxes
  const filteredProvinces = React.useMemo(() => {
    return provinces.filter((p) =>
      p.name.toLowerCase().includes(provinceSearch.toLowerCase())
    );
  }, [provinces, provinceSearch]);

  const filteredDistricts = React.useMemo(() => {
    return districts.filter((d) =>
      d.name.toLowerCase().includes(districtSearch.toLowerCase())
    );
  }, [districts, districtSearch]);

  const filteredWards = React.useMemo(() => {
    return wards.filter((w) =>
      w.name.toLowerCase().includes(wardSearch.toLowerCase())
    );
  }, [wards, wardSearch]);

  return (
    <div className="space-y-4">
      {/* Province Dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Tỉnh / Thành phố
        </label>
        <Controller
          name="province"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(val) => {
                field.onChange(val);
                // Cascading Reset Logic:
                setValue('district', '');
                setValue('ward', '');
                // Clear search inputs
                setProvinceSearch('');
                setDistrictSearch('');
                setWardSearch('');
              }}
              value={field.value}
              disabled={true}
            >
              <SelectTrigger className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3.5 h-auto text-slate-600 text-sm font-semibold cursor-not-allowed">
                <SelectValue placeholder={isLoading ? 'Đang tải Tỉnh/Thành phố...' : 'Chọn Tỉnh / Thành phố'} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl z-[60] p-0 overflow-hidden flex flex-col">
                {/* Search Box */}
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm Tỉnh/Thành..."
                    value={provinceSearch}
                    onChange={(e) => setProvinceSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-transparent text-slate-800 text-xs font-semibold outline-none"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto p-1">
                  {filteredProvinces.map((prov) => (
                    <SelectItem key={prov.code} value={prov.name}>
                      {prov.name}
                    </SelectItem>
                  ))}
                  {filteredProvinces.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-3 font-semibold">
                      Không tìm thấy kết quả
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          )}
        />
        {errors.province && (
          <p className="text-xs text-rose-500 font-bold pl-1">{errors.province.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* District Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Quận / Huyện
          </label>
          <Controller
            name="district"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  // Cascading Reset Logic:
                  setValue('ward', '');
                  // Clear search inputs
                  setDistrictSearch('');
                  setWardSearch('');
                }}
                value={field.value}
                disabled={isLoading || !selectedProvince}
              >
                <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 h-auto text-slate-800 text-sm font-semibold focus:ring-slate-800/10 focus:border-slate-800 transition-all disabled:opacity-50">
                  <SelectValue placeholder={!selectedProvince ? 'Chọn Tỉnh trước' : 'Chọn Quận / Huyện'} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl z-[60] p-0 overflow-hidden flex flex-col">
                  {/* Search Box */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm Quận/Huyện..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent text-slate-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredDistricts.map((dist) => (
                      <SelectItem key={dist.code} value={dist.name}>
                        {dist.name}
                      </SelectItem>
                    ))}
                    {filteredDistricts.length === 0 && (
                      <div className="text-center text-xs text-slate-400 py-3 font-semibold">
                        Không tìm thấy kết quả
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            )}
          />
          {errors.district && (
            <p className="text-xs text-rose-500 font-bold pl-1">{errors.district.message}</p>
          )}
        </div>

        {/* Ward Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Phường / Xã
          </label>
          <Controller
            name="ward"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  setWardSearch('');
                }}
                value={field.value}
                disabled={isLoading || !selectedDistrict}
              >
                <SelectTrigger className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 h-auto text-slate-800 text-sm font-semibold focus:ring-slate-800/10 focus:border-slate-800 transition-all disabled:opacity-50">
                  <SelectValue placeholder={!selectedDistrict ? 'Chọn Huyện trước' : 'Chọn Phường / Xã'} />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 shadow-xl rounded-xl z-[60] p-0 overflow-hidden flex flex-col">
                  {/* Search Box */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm Phường/Xã..."
                      value={wardSearch}
                      onChange={(e) => setWardSearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-transparent text-slate-800 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredWards.map((w) => (
                      <SelectItem key={w.code} value={w.name}>
                        {w.name}
                      </SelectItem>
                    ))}
                    {filteredWards.length === 0 && (
                      <div className="text-center text-xs text-slate-400 py-3 font-semibold">
                        Không tìm thấy kết quả
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            )}
          />
          {errors.ward && (
            <p className="text-xs text-rose-500 font-bold pl-1">{errors.ward.message}</p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-slate-400 text-xs mt-1.5 pl-1 justify-center">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Đang tải dữ liệu hành chính Việt Nam...</span>
        </div>
      )}
    </div>
  );
}
