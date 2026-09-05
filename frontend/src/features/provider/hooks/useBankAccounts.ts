import { useEffect, useCallback } from 'react';
import { useBankStore } from '../stores/useBankStore';
import { bankService } from '../services/bank.service';
import { CreateBankAccountPayload, UpdateBankAccountPayload } from '../types/bank.types';

export const useBankAccounts = () => {
  const { 
    bankAccounts, 
    isLoading, 
    error, 
    isFetched, 
    setBankAccounts,
    addBankAccount,
    updateBankAccount,
    setLoading, 
    setError 
  } = useBankStore();

  const fetchBankAccounts = useCallback(async (force = false) => {
    if (isFetched && !force) return;
    
    try {
      setLoading(true);
      const data = await bankService.getMyBankAccounts();
      setBankAccounts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bank accounts');
      window.alert('Không thể tải danh sách tài khoản ngân hàng');
    } finally {
      setLoading(false);
    }
  }, [isFetched, setBankAccounts, setLoading, setError]);

  useEffect(() => {
    fetchBankAccounts();
  }, [fetchBankAccounts]);

  const createAccount = async (payload: CreateBankAccountPayload) => {
    try {
      setLoading(true);
      const newAccount = await bankService.createBankAccount(payload);
      
      // If it's set as default, we might need to refresh to get updated 'is_default' statuses for other accounts
      // or we just fetch again for simplicity.
      await fetchBankAccounts(true);
      
      window.alert('Thêm tài khoản ngân hàng thành công');
      return true;
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Thêm tài khoản ngân hàng thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAccount = async (id: string) => {
    try {
      setLoading(true);
      await bankService.updateBankAccount(id, { is_default: true });
      await fetchBankAccounts(true);
      window.alert('Đã đặt làm thẻ mặc định');
      return true;
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Cập nhật thất bại');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    bankAccounts, 
    isLoading, 
    error, 
    refreshBankAccounts: () => fetchBankAccounts(true),
    createAccount,
    setDefaultAccount
  };
};
