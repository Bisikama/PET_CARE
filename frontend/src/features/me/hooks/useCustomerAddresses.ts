'use client';

import { useState, useEffect, useCallback } from 'react';
import { customerAddressesService } from '../services/customer-addresses.service';
import { CustomerAddress, CreateAddressInput, UpdateAddressInput } from '../types';

export function useCustomerAddresses({ autoFetch = false }: { autoFetch?: boolean } = {}) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await customerAddressesService.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      console.error('Error fetching customer addresses:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách địa chỉ.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAddress = async (data: CreateAddressInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newAddress = await customerAddressesService.createAddress(data);
      setAddresses((prev) => [newAddress, ...prev]);
      return newAddress;
    } catch (err: any) {
      console.error('Error creating customer address:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể thêm địa chỉ mới.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAddress = async (id: string, data: UpdateAddressInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await customerAddressesService.updateAddress(id, data);
      setAddresses((prev) => prev.map((addr) => (addr.id === id ? updated : addr)));
      return updated;
    } catch (err: any) {
      console.error('Error updating customer address:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể cập nhật địa chỉ.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await customerAddressesService.deleteAddress(id);
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error deleting customer address:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa địa chỉ.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchAddresses();
    }
  }, [autoFetch, fetchAddresses]);

  return {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
  };
}
