import { useState, useCallback, useEffect } from 'react';
import { adminService } from '../services/admin.service';
import { useAdminStore } from '../stores/admin.store';

export function useAdminProviders() {
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fetchPendingKycCount } = useAdminStore();
  
  // Pagination and filter state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [kycStatus, setKycStatus] = useState<string>('PENDING'); // Default to PENDING for validation requests
  const [status, setStatus] = useState<string>('');

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminService.getProviders({
        page,
        limit,
        search: search || undefined,
        kycStatus: kycStatus || undefined,
        status: status || undefined,
      });
      setProviders(result.data || []);
      setTotal(result.meta?.total || 0);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching admin providers:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách đối tác.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, kycStatus, status]);

  // Fetch on mount or dependency change
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const reviewKyc = async (providerId: string, status: 'APPROVED' | 'REJECTED', rejectReason?: string) => {
    setIsLoading(true);
    try {
      await adminService.reviewBulkKyc(providerId, { status, rejectReason });
      await fetchProviders();
      fetchPendingKycCount();
      return true;
    } catch (err: any) {
      console.error('Error reviewing bulk KYC:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi duyệt KYC đối tác.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const approveProvider = async (providerId: string) => {
    setIsLoading(true);
    try {
      await adminService.approveProvider(providerId);
      await fetchProviders();
      fetchPendingKycCount();
      return true;
    } catch (err: any) {
      console.error('Error approving provider:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi phê duyệt đối tác.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectProvider = async (providerId: string, reason: string) => {
    setIsLoading(true);
    try {
      await adminService.rejectProvider(providerId, reason);
      await fetchProviders();
      fetchPendingKycCount();
      return true;
    } catch (err: any) {
      console.error('Error rejecting provider:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi từ chối đối tác.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateScreening = async (providerId: string, screeningStatus: 'PASSED' | 'FAILED' | 'PENDING') => {
    setIsLoading(true);
    try {
      await adminService.updateScreening(providerId, screeningStatus);
      await fetchProviders();
      return true;
    } catch (err: any) {
      console.error('Error updating screening:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi cập nhật screening.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reviewDocument = async (providerId: string, documentId: string, status: 'APPROVED' | 'REJECTED', rejectReason?: string) => {
    setIsLoading(true);
    try {
      await adminService.reviewDocument(documentId, { status, rejectReason });
      if (status === 'APPROVED') {
        try {
          await adminService.grantBadge(providerId, { badgeCode: 'VERIFIED_PROVIDER' });
        } catch (badgeErr) {
          console.warn('Không thể cấp phù hiệu VERIFIED_PROVIDER (có thể do cơ sở dữ liệu chưa được seed phù hiệu này):', badgeErr);
        }
      }
      await fetchProviders();
      return true;
    } catch (err: any) {
      console.error('Error reviewing document:', err);
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi duyệt chứng chỉ.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviderDocuments = async (providerId: string) => {
    try {
      const docs = await adminService.getProviderDocuments(providerId);
      return docs;
    } catch (err: any) {
      console.error('Error fetching provider documents:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải tài liệu đối tác.');
      return [];
    }
  };

  return {
    providers,
    isLoading,
    error,
    page,
    setPage,
    totalPages,
    total,
    search,
    setSearch,
    kycStatus,
    setKycStatus,
    status,
    setStatus,
    fetchProviders,
    reviewKyc,
    approveProvider,
    rejectProvider,
    updateScreening,
    reviewDocument,
    fetchProviderDocuments,
  };
}
