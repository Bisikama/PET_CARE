import { useEffect, useCallback } from 'react';
import { useBankStore } from '../stores/useBankStore';
import { bankService } from '../services/bank.service';
import { CreateBankAccountPayload, UpdateBankAccountPayload } from '../types/bank.types';
import { systemAlert } from '@/components/ui/SystemDialogProvider';

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
      
      systemAlert('Thêm tài khoản ngân hàng thành công', { type: 'success' });
      return true;
    } catch (err: any) {
      systemAlert(err.response?.data?.message || 'Thêm tài khoản ngân hàng thất bại', { type: 'error' });
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
      systemAlert('Đã đặt làm thẻ ngân hàng mặc định', { type: 'success' });
      return true;
    } catch (err: any) {
      systemAlert(err.response?.data?.message || 'Cập nhật thẻ mặc định thất bại', { type: 'error' });
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
