'use client';

import { useState, useEffect } from 'react';
import { meService } from '../services/me.service';

export interface Ward {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  district_code: number;
}

export interface District {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  province_code: number;
  wards: Ward[];
}

export interface Province {
  name: string;
  code: number;
  codename: string;
  division_type: string;
  phone_code: number;
  districts: District[];
}

// Module-level cache to share data across different component instances
let provincesCache: Province[] | null = null;
let fetchPromise: Promise<Province[]> | null = null;

export function useVietNamProvinces() {
  const [provinces, setProvinces] = useState<Province[]>(provincesCache || []);
  const [isLoading, setIsLoading] = useState(!provincesCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (provincesCache) {
      setProvinces(provincesCache);
      setIsLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = meService
        .getProvinces()
        .then((data) => {
          provincesCache = data;
          return data;
        })
        .catch((err) => {
          fetchPromise = null; // Reset promise on error to allow retrying
          throw err;
        });
    }

    let isMounted = true;
    fetchPromise
      .then((data) => {
        if (isMounted) {
          setProvinces(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Không thể tải danh sách Tỉnh/Thành phố.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getDistrictsOf = (provinceName: string): District[] => {
    const province = provinces.find((p) => p.name === provinceName);
    return province ? province.districts : [];
  };

  const getWardsOf = (provinceName: string, districtName: string): Ward[] => {
    const districts = getDistrictsOf(provinceName);
    const district = districts.find((d) => d.name === districtName);
    return district ? district.wards : [];
  };

  return {
    provinces,
    isLoading,
    error,
    getDistrictsOf,
    getWardsOf,
  };
}
