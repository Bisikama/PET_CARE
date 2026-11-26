'use client';

import * as React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Filter,
  Loader2,
  Lock,
  LogOut,
  MonitorSmartphone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Unlock,
  UserPlus,
  Users,
  UserX,
  X,
} from 'lucide-react';
import { adminService } from '../services/admin.service';
import { Portal } from '@/components/ui/Portal';
import { systemAlert, systemConfirm } from '@/components/ui/SystemDialogProvider';
import { getApiErrorMessage } from '@/lib/api-error';

type SubTab = 'users' | 'deactivations';

const ROLE_META: Record<string, { label: string; cls: string }> = {
  ADMIN: { label: 'Quản trị viên', cls: 'bg-[#08243D] text-[#F7C948] border-[#08243D]' },
  PROVIDER: { label: 'Chuyên viên', cls: 'bg-teal-50 text-teal-700 border-teal-200' },
  CUSTOMER: { label: 'Khách hàng', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const USER_STATUS_META: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Đang hoạt động', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PENDING_VERIFICATION: { label: 'Chờ xác thực', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  SUSPENDED: { label: 'Đang khóa', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  BANNED: { label: 'Bị cấm', cls: 'bg-rose-100 text-rose-800 border-rose-300' },
  DELETED: { label: 'Đã hủy', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const DEACTIVATION_STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Chờ duyệt', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED: { label: 'Đã duyệt hủy', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Đã từ chối', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const formatDateTime = (val?: string | null) => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function AdminUserManagement() {
  const [subTab, setSubTab] = React.useState<SubTab>('users');

  // Users list state
  const [users, setUsers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  // Deactivation requests state
  const [deactivations, setDeactivations] = React.useState<any[]>([]);
  const [deactivationStatus, setDeactivationStatus] = React.useState('PENDING');
  const [deactivationLoading, setDeactivationLoading] = React.useState(false);
  const [deactivationError, setDeactivationError] = React.useState<string | null>(null);
  const [pendingDeactivationCount, setPendingDeactivationCount] = React.useState(0);
  const [deactivationPage, setDeactivationPage] = React.useState(1);
  const [deactivationTotalPages, setDeactivationTotalPages] = React.useState(1);

  // Create User Modal
  const [createModal, setCreateModal] = React.useState({
    show: false,
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'PROVIDER' | 'ADMIN',
    submitting: false,
  });

  // Edit / Role Modal
  const [editModal, setEditModal] = React.useState({
    show: false,
    loadingDetail: false,
    userId: '',
    email: '',
    fullName: '',
    phone: '',
    originalRole: 'CUSTOMER' as 'CUSTOMER' | 'PROVIDER' | 'ADMIN',
    role: 'CUSTOMER' as 'CUSTOMER' | 'PROVIDER' | 'ADMIN',
    submitting: false,
  });

  // Sessions Modal
  const [sessionsModal, setSessionsModal] = React.useState<{
    show: boolean;
    userId: string;
    userName: string;
    loading: boolean;
    revoking: boolean;
    sessions: any[];
  }>({
    show: false,
    userId: '',
    userName: '',
    loading: false,
    revoking: false,
    sessions: [],
  });

  // Suspend Modal
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

  // Reactivate Modal
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

  // Reject Deactivation Modal
  const [rejectDeactivationModal, setRejectDeactivationModal] = React.useState<{
    show: boolean;
    requestId: string | null;
    userName: string;
    reason: string;
    submitting: boolean;
  }>({
    show: false,
    requestId: null,
    userName: '',
    reason: '',
    submitting: false,
  });

  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(res?.data || []);
      setTotal(res?.meta?.total || 0);
      setTotalPages(res?.meta?.totalPages || 1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách người dùng.'));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  const fetchDeactivations = React.useCallback(async () => {
    setDeactivationLoading(true);
    setDeactivationError(null);
    try {
      const res = await adminService.getDeactivationRequests({
        page: deactivationPage,
        limit: 10,
        status: deactivationStatus === 'ALL' ? undefined : deactivationStatus,
      });
      const list = Array.isArray(res) ? res : res?.data || [];
      setDeactivations(list);
      setDeactivationTotalPages(res?.meta?.totalPages || 1);
      if (deactivationStatus === 'PENDING') {
        setPendingDeactivationCount(res?.meta?.total ?? list.length);
      }
    } catch (err) {
      setDeactivationError(getApiErrorMessage(err, 'Không thể tải danh sách yêu cầu hủy tài khoản.'));
    } finally {
      setDeactivationLoading(false);
    }
  }, [deactivationPage, deactivationStatus]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    fetchDeactivations();
  }, [fetchDeactivations]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createModal.submitting) return;
    if (!createModal.fullName.trim() || !createModal.email.trim() || createModal.password.length < 6) {
      systemAlert('Vui lòng nhập đầy đủ họ tên, email và mật khẩu tối thiểu 6 ký tự.', { type: 'warning' });
      return;
    }

    setCreateModal((p) => ({ ...p, submitting: true }));
    try {
      await adminService.createUser({
        fullName: createModal.fullName.trim(),
        email: createModal.email.trim(),
        password: createModal.password,
        phone: createModal.phone.trim() || undefined,
        role: createModal.role,
      });
      setCreateModal({
        show: false,
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'CUSTOMER',
        submitting: false,
      });
      systemAlert('Đã tạo tài khoản người dùng mới thành công.', { type: 'success' });
      await fetchUsers();
    } catch (err) {
      systemAlert(getApiErrorMessage(err, 'Tạo tài khoản thất bại.'), { type: 'error' });
      setCreateModal((p) => ({ ...p, submitting: false }));
    }
  };

  // Edit / Role
  const handleOpenEditModal = async (u: any) => {
    setEditModal({
      show: true,
      loadingDetail: true,
      userId: u.id,
      email: u.email || '',
      fullName: u.fullName || '',
      phone: u.phone || '',
      originalRole: u.role || 'CUSTOMER',
      role: u.role || 'CUSTOMER',
      submitting: false,
    });
    try {
      const detail = await adminService.getUserDetail(u.id);
      const userObj = detail?.data || detail;
      setEditModal((prev) => ({
        ...prev,
        loadingDetail: false,
        fullName: userObj?.fullName ?? prev.fullName,
        phone: userObj?.phone ?? prev.phone,
        originalRole: userObj?.role ?? prev.originalRole,
        role: userObj?.role ?? prev.role,
      }));
    } catch {
      setEditModal((prev) => ({ ...prev, loadingDetail: false }));
    }
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editModal.submitting) return;
    setEditModal((p) => ({ ...p, submitting: true }));
    try {
      await adminService.updateUser(editModal.userId, {
        fullName: editModal.fullName.trim() || undefined,
        phone: editModal.phone.trim() || undefined,
      });
      if (editModal.role !== editModal.originalRole) {
        await adminService.updateUserRole(editModal.userId, editModal.role);
      }
      setEditModal((p) => ({ ...p, show: false, submitting: false }));
      systemAlert('Đã cập nhật thông tin người dùng.', { type: 'success' });
      await fetchUsers();
    } catch (err) {
      systemAlert(getApiErrorMessage(err, 'Cập nhật người dùng thất bại.'), { type: 'error' });
      setEditModal((p) => ({ ...p, submitting: false }));
    }
  };

  // Sessions
  const handleOpenSessionsModal = async (u: any) => {
    setSessionsModal({
      show: true,
      userId: u.id,
      userName: u.fullName || u.email || 'Người dùng',
      loading: true,
      revoking: false,
      sessions: [],
    });
    try {
      const res = await adminService.getUserSessions(u.id);
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setSessionsModal((p) => ({ ...p, loading: false, sessions: list }));
    } catch (err) {
      systemAlert(getApiErrorMessage(err, 'Không thể tải danh sách phiên đăng nhập.'), { type: 'error' });
      setSessionsModal((p) => ({ ...p, loading: false }));
    }
  };

  const handleForceLogout = async () => {
    if (!sessionsModal.userId || sessionsModal.revoking) return;
    const ok = await systemConfirm({
      title: 'Xác nhận buộc đăng xuất',
      message: `Thu hồi tất cả phiên đăng nhập của ${sessionsModal.userName}? Người dùng sẽ phải đăng nhập lại trên mọi thiết bị.`,
      confirmText: 'Buộc đăng xuất',
      cancelText: 'Hủy',
      variant: 'danger',
    });
    if (!ok) return;

    setSessionsModal((p) => ({ ...p, revoking: true }));
    try {
      await adminService.deleteUserSessions(sessionsModal.userId);
      setSessionsModal((p) => ({ ...p, revoking: false, sessions: [] }));
      systemAlert('Đã thu hồi toàn bộ phiên đăng nhập của người dùng.', { type: 'success' });
    } catch (err) {
      systemAlert(getApiErrorMessage(err, 'Thu hồi phiên đăng nhập thất bại.'), { type: 'error' });
      setSessionsModal((p) => ({ ...p, revoking: false }));
    }
  };

  // Suspend & Reactivate
  const handleConfirmSuspend = async () => {
    if (!suspendModal.userId || !suspendModal.reason.trim()) return;
    setSuspendModal((p) => ({ ...p, submitting: true }));
    try {
      await adminService.suspendUser(suspendModal.userId, suspendModal.reason.trim());
      setSuspendModal({ show: false, userId: null, userName: '', reason: '', submitting: false });
      await fetchUsers();
    } catch (err) {
      systemAlert(getApiErrorMessage(err, 'Không thể khóa tài khoản.'), { type: 'error' });
      setSuspendModal((p) => ({ ...p, submitting: false }));
    }
  };

  const handleConfirmReactivate = async () => {
    if (!reactivateModal.userId) return;
    setReactivateModal((p) => ({ ...p, submitting: true }));
    try {
      await adminService.reactivateUser(reactivateModal.userId);
      setReactivateModal({ show: false, userId: null, userName: '', submitting: false });
      await fetchUsers();
    } catch (err) {
      systemAlert(getApiErrorMessage(err, 'Không thể mở khóa tài khoản.'), { type: 'error' });
      setReactivateModal((p) => ({ ...p, submitting: false }));
    }
  };

  // Deactivation Approval / Rejection
  const handleApproveDeactivation = async (req: any) => {
    const userName = req.user?.fullName || req.user?.email || req.user_id;
    const ok = await systemConfirm({
      title: 'Duyệt yêu cầu hủy tài khoản',
      message: `Xác nhận hủy tài khoản của ${userName}? Thao tác này sẽ chuyển trạng thái tài khoản sang DELETED và ghi vào Audit Logs.`,
      confirmText: 'Duyệt hủy',
      cancelText: 'Hủy bỏ',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      await adminService.approveDeactivation(req.id);
      systemAlert('Đã phê duyệt yêu cầu hủy tài khoản.', { type: 'success' });
      await Promise.all([fetchDeactivations(), fetchUsers()]);
    } catch (err) {
      systemAlert(getApiErrorMessage(err, 'Phê duyệt yêu cầu hủy thất bại.'), { type: 'error' });
    }
  };

  const handleConfirmRejectDeactivation = async () => {
    if (!rejectDeactivationModal.requestId || !rejectDeactivationModal.reason.trim()) return;
    setRejectDeactivationModal((p) => ({ ...p, submitting: true }));
    try {
      await adminService.rejectDeactivation(
        rejectDeactivationModal.requestId,
        rejectDeactivationModal.reason.trim(),
      );
      setRejectDeactivationModal({
        show: false,
        requestId: null,
        userName: '',
        reason: '',
        submitting: false,
      });
      systemAlert('Đã từ chối yêu cầu hủy tài khoản.', { type: 'success' });
      await fetchDeactivations();
    } catch (err) {
      systemAlert(getApiErrorMessage(err, 'Từ chối yêu cầu thất bại.'), { type: 'error' });
      setRejectDeactivationModal((p) => ({ ...p, submitting: false }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header + Sub-tabs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-[#08243D] tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Quản Lý Người Dùng &amp; Tài Khoản
            </h3>
            <p className="text-xs text-slate-400">
              Quản trị toàn bộ Khách hàng, Chuyên viên và Admin; phân quyền, kiểm soát phiên đăng nhập và xử lý yêu cầu hủy tài khoản.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCreateModal((p) => ({ ...p, show: true }))}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#08243D] hover:bg-[#0d3254] text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4 text-[#F7C948]" />
            Tạo tài khoản mới
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSubTab('users')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'users'
                ? 'bg-[#08243D] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Danh sách người dùng ({total})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('deactivations')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'deactivations'
                ? 'bg-[#08243D] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            Yêu cầu hủy tài khoản
            {pendingDeactivationCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#F7C948] text-[#08243D]">
                {pendingDeactivationCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {subTab === 'users' ? (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-2xs">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm theo tên hoặc email..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-teal-500"
                />
              </div>

              <div className="relative">
                <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setPage(1);
                    setRoleFilter(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-teal-500"
                >
                  <option value="">Tất cả vai trò</option>
                  <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                  <option value="PROVIDER">Chuyên viên (PROVIDER)</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setPage(1);
                    setStatusFilter(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-teal-500"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="ACTIVE">Đang hoạt động (ACTIVE)</option>
                  <option value="PENDING_VERIFICATION">Chờ xác thực</option>
                  <option value="SUSPENDED">Đang khóa (SUSPENDED)</option>
                  <option value="BANNED">Bị cấm (BANNED)</option>
                  <option value="DELETED">Đã hủy (DELETED)</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
                >
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  onClick={fetchUsers}
                  disabled={isLoading}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer disabled:opacity-50"
                  title="Làm mới"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                Đang tải danh sách người dùng...
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Không tìm thấy người dùng nào phù hợp bộ lọc.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Người dùng</th>
                      <th className="px-5 py-3.5">Vai trò</th>
                      <th className="px-5 py-3.5">Trạng thái</th>
                      <th className="px-5 py-3.5">Ngày tạo</th>
                      <th className="px-5 py-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => {
                      const roleMeta = ROLE_META[u.role] || {
                        label: u.role,
                        cls: 'bg-slate-100 text-slate-700 border-slate-200',
                      };
                      const statusMeta = USER_STATUS_META[u.status] || {
                        label: u.status,
                        cls: 'bg-slate-100 text-slate-700 border-slate-200',
                      };
                      const isLocked = u.status === 'SUSPENDED' || u.status === 'BANNED';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-[#08243D]">{u.fullName || 'Chưa đặt tên'}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                            <div className="text-[10px] font-mono text-slate-400">#{u.id.slice(0, 8)}</div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleMeta.cls}`}>
                              {roleMeta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusMeta.cls}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                            {formatDateTime(u.createdAt)}
                          </td>
                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors cursor-pointer"
                                title="Sửa thông tin & đổi vai trò"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                Sửa / Role
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenSessionsModal(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors cursor-pointer"
                                title="Quản lý phiên đăng nhập"
                              >
                                <MonitorSmartphone className="w-3.5 h-3.5" />
                                Phiên
                              </button>

                              {u.status !== 'DELETED' &&
                                (isLocked ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setReactivateModal({
                                        show: true,
                                        userId: u.id,
                                        userName: u.fullName || u.email,
                                        submitting: false,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer"
                                  >
                                    <Unlock className="w-3.5 h-3.5" />
                                    Mở khóa
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSuspendModal({
                                        show: true,
                                        userId: u.id,
                                        userName: u.fullName || u.email,
                                        reason: '',
                                        submitting: false,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors cursor-pointer"
                                  >
                                    <Lock className="w-3.5 h-3.5" />
                                    Khóa
                                  </button>
                                ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
                <span className="text-slate-500">
                  Trang <strong>{page}</strong> / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || isLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages || isLoading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Deactivation Requests Sub-tab */
        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: 'PENDING', label: 'Chờ duyệt' },
                { key: 'APPROVED', label: 'Đã duyệt' },
                { key: 'REJECTED', label: 'Đã từ chối' },
                { key: 'ALL', label: 'Tất cả' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setDeactivationPage(1);
                    setDeactivationStatus(item.key);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    deactivationStatus === item.key
                      ? 'bg-[#08243D] text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={fetchDeactivations}
              disabled={deactivationLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${deactivationLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
          </div>

          {deactivationError && (
            <div className="m-5 p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200">
              {deactivationError}
            </div>
          )}

          {deactivationLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              Đang tải yêu cầu hủy tài khoản...
            </div>
          ) : deactivations.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Không có yêu cầu hủy tài khoản nào trong mục này.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {deactivations.map((req) => {
                const meta = DEACTIVATION_STATUS_META[req.status] || {
                  label: req.status,
                  cls: 'bg-slate-100 text-slate-600 border-slate-200',
                };
                const userName = req.user?.fullName || req.user?.email || req.user_id;

                return (
                  <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[#08243D] text-sm">{userName}</span>
                        {req.user?.role && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            {req.user.role}
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </div>
                      {req.user?.email && <div className="text-slate-500">{req.user.email}</div>}
                      <div className="text-slate-600">
                        <strong>Lý do:</strong> {req.reason || 'Không ghi lý do'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Gửi lúc: {formatDateTime(req.requested_at || req.created_at)}
                        {req.admin_note && ` · Ghi chú Admin: ${req.admin_note}`}
                      </div>
                    </div>

                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApproveDeactivation(req)}
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Duyệt hủy
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRejectDeactivationModal({
                              show: true,
                              requestId: req.id,
                              userName,
                              reason: '',
                              submitting: false,
                            })
                          }
                          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {deactivationTotalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
              <span className="text-slate-500">
                Trang <strong>{deactivationPage}</strong> / {deactivationTotalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={deactivationPage <= 1}
                  onClick={() => setDeactivationPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={deactivationPage >= deactivationTotalPages}
                  onClick={() => setDeactivationPage((p) => Math.min(deactivationTotalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      {createModal.show && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-[#08243D] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-teal-600" />
                  Tạo Tài Khoản Mới
                </h4>
                <button
                  type="button"
                  onClick={() => setCreateModal((p) => ({ ...p, show: false }))}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={createModal.fullName}
                    onChange={(e) => setCreateModal((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={createModal.email}
                    onChange={(e) => setCreateModal((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mật khẩu (tối thiểu 6 ký tự) *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createModal.password}
                    onChange={(e) => setCreateModal((p) => ({ ...p, password: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-teal-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Số điện thoại</label>
                    <input
                      type="text"
                      value={createModal.phone}
                      onChange={(e) => setCreateModal((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Vai trò *</label>
                    <select
                      value={createModal.role}
                      onChange={(e) =>
                        setCreateModal((p) => ({ ...p, role: e.target.value as 'CUSTOMER' | 'PROVIDER' | 'ADMIN' }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-teal-500 font-semibold"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="PROVIDER">PROVIDER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setCreateModal((p) => ({ ...p, show: false }))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={createModal.submitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#08243D] hover:bg-[#0d3254] text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    {createModal.submitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Edit User & Role Modal */}
      {editModal.show && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-[#08243D]">Cập Nhật Người Dùng</h4>
                  <p className="text-[11px] text-slate-400">{editModal.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModal((p) => ({ ...p, show: false }))}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editModal.loadingDetail ? (
                <div className="py-8 flex justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : (
                <form onSubmit={handleSaveEditUser} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Họ và tên</label>
                    <input
                      type="text"
                      value={editModal.fullName}
                      onChange={(e) => setEditModal((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Số điện thoại</label>
                    <input
                      type="text"
                      value={editModal.phone}
                      onChange={(e) => setEditModal((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Vai trò (Role)</label>
                    <select
                      value={editModal.role}
                      onChange={(e) =>
                        setEditModal((p) => ({ ...p, role: e.target.value as 'CUSTOMER' | 'PROVIDER' | 'ADMIN' }))
                      }
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-teal-500 font-semibold"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="PROVIDER">PROVIDER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditModal((p) => ({ ...p, show: false }))}
                      className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={editModal.submitting}
                      className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer disabled:opacity-50"
                    >
                      {editModal.submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Portal>
      )}

      {/* Sessions Modal */}
      {sessionsModal.show && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-[#08243D]">Phiên Đăng Nhập</h4>
                  <p className="text-xs text-slate-400">{sessionsModal.userName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSessionsModal((p) => ({ ...p, show: false }))}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sessionsModal.loading ? (
                <div className="py-10 flex justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              ) : sessionsModal.sessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Không có phiên đăng nhập nào đang hoạt động.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 text-xs">
                  {sessionsModal.sessions.map((s) => (
                    <div key={s.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="font-bold text-slate-800">{s.device_info || s.device_id || 'Thiết bị không rõ'}</div>
                      <div className="text-slate-500">IP: {s.ip_address || '—'}</div>
                      <div className="text-[11px] text-slate-400">
                        Hoạt động cuối: {formatDateTime(s.last_active_at)} · Hết hạn: {formatDateTime(s.expires_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSessionsModal((p) => ({ ...p, show: false }))}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleForceLogout}
                  disabled={sessionsModal.revoking || sessionsModal.sessions.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {sessionsModal.revoking ? 'Đang thu hồi...' : 'Buộc đăng xuất tất cả'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Suspend Modal */}
      {suspendModal.show && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-rose-600 font-black text-base">
                <ShieldAlert className="w-5 h-5" />
                Khóa Tài Khoản
              </div>
              <p className="text-slate-600">
                Khóa tài khoản <strong>{suspendModal.userName}</strong>. Vui lòng nhập lý do:
              </p>
              <textarea
                rows={3}
                value={suspendModal.reason}
                onChange={(e) => setSuspendModal((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Nhập lý do khóa tài khoản..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-rose-500"
              />
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setSuspendModal({ show: false, userId: null, userName: '', reason: '', submitting: false })}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!suspendModal.reason.trim() || suspendModal.submitting}
                  onClick={handleConfirmSuspend}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 cursor-pointer"
                >
                  {suspendModal.submitting ? 'Đang khóa...' : 'Xác nhận khóa'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Reactivate Modal */}
      {reactivateModal.show && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-black text-base">
                <CheckCircle2 className="w-5 h-5" />
                Mở Khóa Tài Khoản
              </div>
              <p className="text-slate-600">
                Xác nhận kích hoạt lại tài khoản <strong>{reactivateModal.userName}</strong>?
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setReactivateModal({ show: false, userId: null, userName: '', submitting: false })}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={reactivateModal.submitting}
                  onClick={handleConfirmReactivate}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-40 cursor-pointer"
                >
                  {reactivateModal.submitting ? 'Đang xử lý...' : 'Mở khóa ngay'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Reject Deactivation Modal */}
      {rejectDeactivationModal.show && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
              <h4 className="text-base font-black text-[#08243D]">Từ Chối Yêu Cầu Hủy Tài Khoản</h4>
              <p className="text-slate-600">
                Người dùng: <strong>{rejectDeactivationModal.userName}</strong>
              </p>
              <textarea
                rows={3}
                value={rejectDeactivationModal.reason}
                onChange={(e) => setRejectDeactivationModal((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Nhập lý do từ chối yêu cầu hủy..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-teal-500"
              />
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setRejectDeactivationModal({ show: false, requestId: null, userName: '', reason: '', submitting: false })
                  }
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!rejectDeactivationModal.reason.trim() || rejectDeactivationModal.submitting}
                  onClick={handleConfirmRejectDeactivation}
                  className="flex-1 py-2.5 rounded-xl bg-[#08243D] text-white font-bold disabled:opacity-40 cursor-pointer"
                >
                  {rejectDeactivationModal.submitting ? 'Đang gửi...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
