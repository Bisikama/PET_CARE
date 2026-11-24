'use client';

import * as React from 'react';
import { 
  Users, 
  Search, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Loader2, 
  Filter,
  ShieldAlert,
  UserCheck,
  UserX,
  Mail,
  XCircle,
  Shield
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { Portal } from '@/components/ui/Portal';
import { systemAlert } from '@/components/ui/SystemDialogProvider';

export function AdminUserManagement() {
  const [providers, setProviders] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  // Suspend modal state
  const [suspendModal, setSuspendModal] = React.useState<{
    show: boolean;
    userId: string | null;
    userName: string;
    reason: string;
    submitting: boolean;
  }>({
    show: false,
    userId: null,
    userName: '',
    reason: '',
    submitting: false,
  });

  // Reactivate modal state
  const [reactivateModal, setReactivateModal] = React.useState<{
    show: boolean;
    userId: string | null;
    userName: string;
    submitting: boolean;
  }>({
    show: false,
    userId: null,
    userName: '',
    submitting: false,
  });

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getProviders({
        page,
        limit: 10,
        search: search || undefined,
      });
      setProviders(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      console.error('Error fetching users for admin management:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenSuspendModal = (userId: string, userName: string) => {
    setSuspendModal({
      show: true,
      userId,
      userName,
      reason: '',
      submitting: false,
    });
  };

  const handleConfirmSuspend = async () => {
    if (!suspendModal.userId || !suspendModal.reason.trim()) return;

    setSuspendModal((prev) => ({ ...prev, submitting: true }));
    try {
      await adminService.suspendUser(suspendModal.userId, suspendModal.reason.trim());
      setSuspendModal({ show: false, userId: null, userName: '', reason: '', submitting: false });
      await fetchUsers();
    } catch (err: any) {
      console.error('Error suspending user:', err);
      systemAlert(err?.response?.data?.message || err?.message || 'Không thể khóa tài khoản.', {
        type: 'error',
      });
      setSuspendModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const handleOpenReactivateModal = (userId: string, userName: string) => {
    setReactivateModal({
      show: true,
      userId,
      userName,
      submitting: false,
    });
  };

  const handleConfirmReactivate = async () => {
    if (!reactivateModal.userId) return;

    setReactivateModal((prev) => ({ ...prev, submitting: true }));
    try {
      await adminService.reactivateUser(reactivateModal.userId);
      setReactivateModal({ show: false, userId: null, userName: '', submitting: false });
      await fetchUsers();
    } catch (err: any) {
      console.error('Error reactivating user:', err);
      systemAlert(err?.response?.data?.message || err?.message || 'Không thể mở khóa tài khoản.', {
        type: 'error',
      });
      setReactivateModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Search & Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#08243D] tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-[#08243D]" />
              Quản Trị Người Dùng &amp; Trạng Thái Tài Khoản
            </h3>
            <p className="text-xs text-slate-400">
              Kiểm soát quyền truy cập, trạng thái hoạt động và xử lý vi phạm trên hệ thống.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-[#08243D] focus:ring-2 focus:ring-[#08243D]/10 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#08243D]" />
            <span className="text-xs font-bold text-slate-500">Đang tải danh sách tài khoản...</span>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Không tìm thấy tài khoản nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Người dùng / Email</th>
                  <th className="py-4 px-4">Loại tài khoản</th>
                  <th className="py-4 px-4">Trạng thái hồ sơ</th>
                  <th className="py-4 px-4">Trạng thái tài khoản</th>
                  <th className="py-4 px-6 text-right">Thao tác Quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {providers.map((p) => {
                  const userObj = p.users || {};
                  const userId = p.user_id || p.userId || p.id;
                  const fullName = userObj.fullName || 'Người dùng';
                  const email = userObj.email || 'N/A';
                  const isUserSuspended = p.status === 'SUSPENDED' || userObj.status === 'SUSPENDED';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#08243D] text-[#F7C948] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                            {userObj.avatarUrl ? (
                              <img src={userObj.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                            ) : (
                              fullName.charAt(0) || 'U'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#08243D] text-xs">{fullName}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                          Đối Tác (Provider)
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl border ${
                          p.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                            : p.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                            : 'bg-amber-50 text-amber-700 border-amber-200/80'
                        }`}>
                          {p.status === 'APPROVED' ? '✓ Đã kích hoạt' : p.status === 'REJECTED' ? '✕ Từ chối' : '⏳ Chờ duyệt'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isUserSuspended
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isUserSuspended ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          {isUserSuspended ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isUserSuspended ? (
                          <button
                            type="button"
                            onClick={() => handleOpenReactivateModal(userId, fullName)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-all cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Mở khóa
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenSuspendModal(userId, fullName)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Khóa tài khoản
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>
              Trang <strong className="text-[#08243D]">{page}</strong> / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {suspendModal.show && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
            <div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
              onClick={() => !suspendModal.submitting && setSuspendModal((p) => ({ ...p, show: false }))}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 z-10 border border-slate-100 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">Khóa tài khoản người dùng</h4>
                  <p className="text-xs text-slate-400 font-medium">{suspendModal.userName}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Lý do khóa tài khoản (Bắt buộc)
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập chi tiết lý do vi phạm hoặc quyết định xử lý..."
                  value={suspendModal.reason}
                  onChange={(e) => setSuspendModal((p) => ({ ...p, reason: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-[#08243D] transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendModal((p) => ({ ...p, show: false }))}
                  disabled={suspendModal.submitting}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSuspend}
                  disabled={suspendModal.submitting || !suspendModal.reason.trim()}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {suspendModal.submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Xác nhận khóa'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Reactivate Modal */}
      {reactivateModal.show && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 select-none">
            <div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
              onClick={() => !reactivateModal.submitting && setReactivateModal((p) => ({ ...p, show: false }))}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4 z-10 border border-slate-100 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Unlock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-800">Mở khóa tài khoản</h4>
                  <p className="text-xs text-slate-400 font-medium">{reactivateModal.userName}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl leading-relaxed">
                Bạn có chắc chắn muốn khôi phục quyền truy cập cho người dùng này? Tài khoản sẽ chuyển về trạng thái hoạt động bình thường.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReactivateModal((p) => ({ ...p, show: false }))}
                  disabled={reactivateModal.submitting}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReactivate}
                  disabled={reactivateModal.submitting}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {reactivateModal.submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Xác nhận mở khóa'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
