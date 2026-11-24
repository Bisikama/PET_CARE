'use client';

import * as React from 'react';
import { useAdminProviders } from '../hooks/useAdminProviders';
import { ActionConfirmModal, ActionType } from './ActionConfirmModal';
import {
  Search,
  Check,
  X,
  Eye,
  UserCheck,
  UserX,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldCheck,
  FileText,
  Mail,
  Phone,
  Briefcase,
  IdCard,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react';
import { formatDate } from '@/utils/formatDate';

// ─── Status Pill Component ──────────────────────────────────────────
function StatusPill({
  step,
  status,
  label,
}: {
  step: string;
  status: 'pending' | 'success' | 'danger' | 'neutral';
  label: string;
}) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  }[status];

  const dotStyles = {
    pending: 'bg-amber-500',
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
  }[status];

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
        {step}
      </span>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${styles}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} />
        {label}
      </span>
    </div>
  );
}

export function PartnerVerificationList() {
  const {
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
    reviewKyc,
    approveProvider,
    rejectProvider,
    updateScreening,
    reviewDocument,
    fetchProviderDocuments,
  } = useAdminProviders();

  const [expandedProviderId, setExpandedProviderId] = React.useState<string | null>(null);
  const [providerDocs, setProviderDocs] = React.useState<any[]>([]);
  const [docsLoading, setDocsLoading] = React.useState(false);

  const [actionModal, setActionModal] = React.useState<{
    show: boolean;
    title: string;
    message: string;
    actionType: ActionType | null;
    providerId: string | null;
    documentId?: string | null;
  }>({
    show: false,
    title: '',
    message: '',
    actionType: null,
    providerId: null,
    documentId: null,
  });

  const handleExpandToggle = async (providerId: string) => {
    if (expandedProviderId === providerId) {
      setExpandedProviderId(null);
      setProviderDocs([]);
      return;
    }
    setExpandedProviderId(providerId);
    setDocsLoading(true);
    setProviderDocs([]);
    try {
      const docs = await fetchProviderDocuments(providerId);
      setProviderDocs(docs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleApproveKycClick = (providerId: string) => {
    setActionModal({
      show: true,
      title: 'Phê duyệt eKYC Đối Tác',
      message: 'Xác nhận hồ sơ định danh và ảnh CCCD đối tác hoàn toàn hợp lệ. Trạng thái KYC sẽ chuyển sang ĐÃ DUYỆT.',
      actionType: 'approve-kyc',
      providerId,
    });
  };

  const handleOpenRejectModal = (providerId: string, type: 'KYC' | 'PROVIDER') => {
    setActionModal({
      show: true,
      title: type === 'KYC' ? 'Từ chối xét duyệt eKYC' : 'Đình chỉ hoạt động đối tác',
      message:
        type === 'KYC'
          ? 'Vui lòng cung cấp lý do từ chối rõ ràng để đối tác cập nhật lại hình ảnh/thông tin đúng quy chuẩn.'
          : 'Xác nhận đình chỉ hoạt động đối tác này. Đối tác sẽ không thể nhận thêm ca làm mới.',
      actionType: type === 'KYC' ? 'reject-kyc' : 'reject-partner',
      providerId,
    });
  };

  const handleApproveDocumentClick = (providerId: string, documentId: string, docLabel: string) => {
    setActionModal({
      show: true,
      title: 'Phê duyệt tài liệu',
      message: `Xác nhận tài liệu "${docLabel}" đạt tiêu chuẩn xác minh?`,
      actionType: 'approve-document',
      providerId,
      documentId,
    });
  };

  const handleRejectDocumentClick = (providerId: string, documentId: string, docLabel: string) => {
    setActionModal({
      show: true,
      title: 'Từ chối tài liệu',
      message: `Nhập lý do từ chối tài liệu "${docLabel}". Đối tác sẽ nhận thông báo để tải lại.`,
      actionType: 'reject-document',
      providerId,
      documentId,
    });
  };

  const handleConfirmAction = async (reason?: string) => {
    const { actionType, providerId, documentId } = actionModal;
    if (!providerId || !actionType) return;
    if (actionType === 'approve-kyc') await reviewKyc(providerId, 'APPROVED');
    else if (actionType === 'approve-partner') await approveProvider(providerId);
    else if (actionType === 'approve-screening') await updateScreening(providerId, 'PASSED');
    else if (actionType === 'reject-kyc') await reviewKyc(providerId, 'REJECTED', reason);
    else if (actionType === 'reject-partner') await rejectProvider(providerId, reason!);
    else if (actionType === 'approve-document' && documentId) {
      const ok = await reviewDocument(providerId, documentId, 'APPROVED');
      if (ok) {
        const docs = await fetchProviderDocuments(providerId);
        setProviderDocs(docs || []);
      }
    } else if (actionType === 'reject-document' && documentId) {
      const ok = await reviewDocument(providerId, documentId, 'REJECTED', reason);
      if (ok) {
        const docs = await fetchProviderDocuments(providerId);
        setProviderDocs(docs || []);
      }
    }
    setActionModal((prev) => ({ ...prev, show: false }));
  };

  const handleApproveScreeningClick = (providerId: string) => {
    setActionModal({
      show: true,
      title: 'Xác nhận Sàng lọc Lý lịch (Screening)',
      message: 'Xác nhận bạn đã rà soát lý lịch tư pháp của đối tác và đạt yêu cầu hoạt động (PASSED).',
      actionType: 'approve-screening',
      providerId,
    });
  };

  const handleApprovePartnerClick = (providerId: string) => {
    setActionModal({
      show: true,
      title: 'Cấp quyền hoạt động chính thức',
      message: 'Kích hoạt chính thức tài khoản đối tác. Đối tác sẽ xuất hiện trên ứng dụng khách hàng và có thể nhận lịch chăm sóc thú cưng.',
      actionType: 'approve-partner',
      providerId,
    });
  };

  // Quick tab filters
  const activeFilterPreset =
    kycStatus === 'PENDING' && status === ''
      ? 'pending-kyc'
      : kycStatus === 'APPROVED' && status === 'PENDING'
      ? 'pending-activation'
      : status === 'APPROVED'
      ? 'active'
      : status === 'REJECTED'
      ? 'rejected'
      : 'all';

  const setFilterPreset = (preset: 'all' | 'pending-kyc' | 'pending-activation' | 'active' | 'rejected') => {
    setPage(1);
    if (preset === 'all') {
      setKycStatus('');
      setStatus('');
    } else if (preset === 'pending-kyc') {
      setKycStatus('PENDING');
      setStatus('');
    } else if (preset === 'pending-activation') {
      setKycStatus('APPROVED');
      setStatus('PENDING');
    } else if (preset === 'active') {
      setKycStatus('');
      setStatus('APPROVED');
    } else if (preset === 'rejected') {
      setKycStatus('');
      setStatus('REJECTED');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* ── Toolbar: Tabs, Search & Filters ─────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#08243D] tracking-tight">
                Danh Sách Xét Duyệt Đối Tác
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#08243D]/5 text-[#08243D] border border-slate-200">
                {total} đối tác
              </span>
            </div>
            <p className="text-slate-400 text-xs font-normal">
              Rà soát định danh eKYC, chứng chỉ chuyên môn và cấp quyền hoạt động trên nền tảng.
            </p>
          </div>

          {/* Quick preset tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl overflow-x-auto shrink-0">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending-kyc', label: 'Chờ duyệt eKYC' },
              { id: 'pending-activation', label: 'Chờ kích hoạt' },
              { id: 'active', label: 'Đang hoạt động' },
              { id: 'rejected', label: 'Đình chỉ / Từ chối' },
            ].map((tab) => {
              const isActive = activeFilterPreset === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterPreset(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#08243D] shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Select dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl text-slate-800 text-xs font-medium outline-none focus:border-[#08243D] focus:ring-2 focus:ring-[#08243D]/10 transition-all placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="md:col-span-3">
            <select
              value={kycStatus}
              onChange={(e) => {
                setKycStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-700 text-xs font-semibold outline-none focus:border-[#08243D] transition-all cursor-pointer"
            >
              <option value="">Trạng thái KYC (Tất cả)</option>
              <option value="PENDING">Chờ duyệt eKYC</option>
              <option value="APPROVED">eKYC Đã duyệt</option>
              <option value="REJECTED">eKYC Đã từ chối</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-700 text-xs font-semibold outline-none focus:border-[#08243D] transition-all cursor-pointer"
            >
              <option value="">Trạng thái tài khoản (Tất cả)</option>
              <option value="PENDING">Chờ cấp quyền hoạt động</option>
              <option value="APPROVED">Đang hoạt động chính thức</option>
              <option value="REJECTED">Đã đình chỉ / Từ chối</option>
              <option value="DRAFT">Hồ sơ nháp</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Partner List ───────────────────────────────────────────────── */}
      {isLoading && providers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm p-16 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-[#08243D] animate-spin" />
          <p className="text-xs font-bold text-slate-500">Đang đồng bộ danh sách đối tác...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-rose-200/80 shadow-sm p-12 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-rose-500" />
          <p className="text-xs font-bold text-rose-700">{error}</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm p-16 text-center space-y-2">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Không tìm thấy hồ sơ đối tác nào</p>
          <p className="text-xs text-slate-400">Hãy thử thay đổi bộ lọc tìm kiếm hoặc từ khóa phía trên.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider) => {
            const isExpanded = expandedProviderId === provider.id;

            // Pipeline statuses
            const kycState =
              provider.kyc_status === 'APPROVED' ? 'success'
              : provider.kyc_status === 'PENDING' ? 'pending'
              : 'danger';

            const screeningState =
              provider.screening_status === 'PASSED' ? 'success'
              : provider.screening_status === 'FAILED' ? 'danger'
              : 'neutral';

            const profileState =
              provider.status === 'APPROVED' ? 'success'
              : provider.status === 'REJECTED' ? 'danger'
              : 'pending';

            const providerTypeLabel =
              provider.provider_type === 'SITTER'
                ? { label: 'Pet Sitter (Trông giữ)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200/80' }
                : provider.provider_type === 'GROOMER'
                ? { label: 'Groomer (Cắt tỉa & Spa)', color: 'bg-amber-50 text-amber-700 border-amber-200/80' }
                : { label: 'Chăm sóc / Thú y', color: 'bg-teal-50 text-teal-700 border-teal-200/80' };

            // Left indicator border color
            const borderAccent =
              provider.kyc_status === 'PENDING'
                ? 'border-l-4 border-l-amber-400'
                : provider.status === 'APPROVED'
                ? 'border-l-4 border-l-emerald-500'
                : provider.status === 'REJECTED'
                ? 'border-l-4 border-l-rose-500'
                : 'border-l-4 border-l-[#08243D]/30';

            return (
              <div
                key={provider.id}
                className={`bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${borderAccent}`}
              >
                {/* ── Main Partner Row ── */}
                <div className="p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  {/* Partner Identity & Contact */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-13 h-13 rounded-2xl bg-[#08243D] text-[#F7C948] font-bold text-lg flex items-center justify-center uppercase shrink-0 shadow-xs overflow-hidden border border-slate-200/80">
                      {provider.users?.avatarUrl ? (
                        <img
                          src={provider.users.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        provider.users?.fullName?.charAt(0) || 'P'
                      )}
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-bold text-[#08243D] text-base truncate">
                          {provider.users?.fullName || 'Chưa cập nhật tên'}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${providerTypeLabel.color}`}
                        >
                          {providerTypeLabel.label}
                        </span>
                      </div>

                      {/* Contacts & Metadata */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[220px]">{provider.users?.email || 'N/A'}</span>
                        </span>
                        {provider.users?.phone && (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{provider.users?.phone}</span>
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>Kinh nghiệm: <strong>{provider.experience_years || 0} năm</strong></span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                          <IdCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>CCCD: <strong className="font-mono">{provider.id_number || 'Chưa có'}</strong></span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual 3-Step Verification Pipeline */}
                  <div className="flex items-center gap-4 bg-slate-50/70 border border-slate-100 rounded-2xl px-4 py-3 shrink-0">
                    <StatusPill
                      step="1. Định danh eKYC"
                      status={kycState}
                      label={
                        provider.kyc_status === 'APPROVED'
                          ? 'Đã duyệt'
                          : provider.kyc_status === 'PENDING'
                          ? 'Chờ duyệt'
                          : 'Từ chối'
                      }
                    />
                    <div className="w-px h-8 bg-slate-200/60 hidden sm:block" />
                    <StatusPill
                      step="2. Sàng lọc lý lịch"
                      status={screeningState}
                      label={
                        provider.screening_status === 'PASSED'
                          ? 'Đã kiểm tra'
                          : provider.screening_status === 'FAILED'
                          ? 'Bị loại'
                          : 'Chưa sàng lọc'
                      }
                    />
                    <div className="w-px h-8 bg-slate-200/60 hidden sm:block" />
                    <StatusPill
                      step="3. Quyền hoạt động"
                      status={profileState}
                      label={
                        provider.status === 'APPROVED'
                          ? 'Hoạt động'
                          : provider.status === 'REJECTED'
                          ? 'Đình chỉ'
                          : 'Chờ kích hoạt'
                      }
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end xl:self-center flex-wrap">
                    {/* Expand details button */}
                    <button
                      type="button"
                      onClick={() => handleExpandToggle(provider.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isExpanded
                          ? 'bg-[#08243D] text-white border-[#08243D]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Hồ sơ &amp; eKYC
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Pending KYC: Quick Approve / Reject buttons */}
                    {provider.kyc_status === 'PENDING' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenRejectModal(provider.id, 'KYC')}
                          title="Từ chối eKYC"
                          className="flex items-center gap-1 px-3 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveKycClick(provider.id)}
                          title="Duyệt eKYC"
                          className="flex items-center gap-1 px-3.5 py-2 text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Duyệt eKYC
                        </button>
                      </div>
                    )}

                    {/* KYC Approved but needs Screening */}
                    {provider.kyc_status === 'APPROVED' &&
                      provider.screening_status !== 'PASSED' &&
                      provider.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleApproveScreeningClick(provider.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Duyệt Lý lịch
                        </button>
                      )}

                    {/* KYC Approved & Screening Passed but needs Profile Activation */}
                    {provider.kyc_status === 'APPROVED' &&
                      provider.screening_status === 'PASSED' &&
                      provider.status !== 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleApprovePartnerClick(provider.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Kích hoạt hoạt động
                        </button>
                      )}

                    {/* Active partner: Suspend button */}
                    {provider.status === 'APPROVED' && (
                      <button
                        type="button"
                        onClick={() => handleOpenRejectModal(provider.id, 'PROVIDER')}
                        className="flex items-center gap-1.5 px-3 py-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Đình chỉ
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Expanded eKYC Inspection Drawer ── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-[#fbfcfd] p-6 md:p-8 space-y-6 animate-fade-in">
                    {/* Bio note if any */}
                    {provider.bio && (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Giới thiệu bản thân &amp; Kinh nghiệm thực tế
                        </span>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">
                          {provider.bio}
                        </p>
                      </div>
                    )}

                    {/* ID Details & Verification Guidelines */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Left: Monospace Spec table */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                        <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-[#08243D] flex items-center gap-1.5">
                            <IdCard className="w-4 h-4 text-slate-500" />
                            Thông Tin Định Danh (CCCD / CMND)
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Đối soát</span>
                        </div>
                        <div className="divide-y divide-slate-100 text-xs">
                          <div className="px-4 py-2.5 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Họ tên trên CCCD</span>
                            <span className="font-bold text-slate-800 uppercase">
                              {provider.full_name_on_id || provider.users?.fullName || '—'}
                            </span>
                          </div>
                          <div className="px-4 py-2.5 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Số định danh CCCD</span>
                            <span className="font-bold font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                              {provider.id_number || 'Chưa cung cấp'}
                            </span>
                          </div>
                          <div className="px-4 py-2.5 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Ngày sinh</span>
                            <span className="font-semibold text-slate-700">
                              {provider.dob
                                ? formatDate(provider.dob, { day: '2-digit', month: '2-digit', year: 'numeric' })
                                : '—'}
                            </span>
                          </div>
                          <div className="px-4 py-2.5 flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Ngày cấp CCCD</span>
                            <span className="font-semibold text-slate-700">
                              {provider.issue_date
                                ? formatDate(provider.issue_date, { day: '2-digit', month: '2-digit', year: 'numeric' })
                                : '—'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Review Standard Checklist */}
                      <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          Tiêu chuẩn đối chiếu hồ sơ eKYC
                        </div>
                        <ul className="text-xs text-amber-800/90 space-y-1.5 list-disc pl-5 leading-relaxed">
                          <li>
                            Họ tên và số CCCD trên hệ thống phải <strong>trùng khớp 100%</strong> với ảnh mặt trước thẻ.
                          </li>
                          <li>
                            Ảnh chân dung đối tác chụp rõ nét, không dùng bộ lọc che mặt, đúng người trên ảnh CCCD.
                          </li>
                          <li>
                            Chứng chỉ chuyên môn (nếu có) phải còn hiệu lực hoặc được cấp bởi đơn vị đào tạo uy tín.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Submitted Documents & Certificates */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-[#08243D] uppercase tracking-wider flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          Tài liệu &amp; Hình ảnh minh chứng ({providerDocs.length})
                        </h5>
                      </div>

                      {docsLoading ? (
                        <div className="p-8 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-500">
                          <Loader2 className="w-4 h-4 text-[#08243D] animate-spin" />
                          Đang tải hồ sơ hình ảnh...
                        </div>
                      ) : providerDocs.length === 0 ? (
                        <div className="p-6 bg-white rounded-2xl border border-slate-200/80 text-center text-xs font-medium text-slate-400">
                          Đối tác chưa tải lên tài liệu xác thực nào.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {providerDocs.map((doc) => {
                            const documentLabels: Record<string, string> = {
                              IDENTITY_CARD: 'Ảnh CCCD / CMND',
                              FACE_PORTRAIT: 'Ảnh chân dung trực diện',
                              GROOMING_CERTIFICATE: 'Chứng chỉ Cắt tỉa (Grooming)',
                              PET_CARE_CERTIFICATE: 'Chứng chỉ Chăm sóc thú cưng',
                              FIRST_AID_CERTIFICATE: 'Chứng chỉ Sơ cấp cứu thú cưng',
                              BACKGROUND_SCREENING: 'Lý lịch tư pháp',
                              OTHER: 'Tài liệu bổ sung khác',
                            };
                            const docTitle = documentLabels[doc.document_type] || doc.note || 'Tài liệu xác minh';
                            const isPdf = doc.file_url?.toLowerCase().endsWith('.pdf');

                            return (
                              <div
                                key={doc.id}
                                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between"
                              >
                                <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                                  <span className="text-xs font-bold text-[#08243D] truncate" title={docTitle}>
                                    {docTitle}
                                  </span>
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                      doc.status === 'APPROVED'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : doc.status === 'REJECTED'
                                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    {doc.status === 'APPROVED'
                                      ? 'Đã duyệt'
                                      : doc.status === 'REJECTED'
                                      ? 'Từ chối'
                                      : 'Chờ duyệt'}
                                  </span>
                                </div>

                                <div className="relative h-44 bg-slate-50 group overflow-hidden flex items-center justify-center">
                                  {isPdf ? (
                                    <div className="flex flex-col items-center justify-center p-4 text-center gap-2">
                                      <FileText className="w-10 h-10 text-rose-500" />
                                      <span className="text-xs font-bold text-slate-700">Tài liệu PDF</span>
                                      <span className="text-[10px] text-slate-400">Bấm để mở file gốc</span>
                                    </div>
                                  ) : (
                                    <img
                                      src={doc.file_url}
                                      alt={docTitle}
                                      className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-105"
                                    />
                                  )}

                                  <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute inset-0 bg-[#08243D]/60 opacity-0 group-hover:opacity-100 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-opacity duration-150 backdrop-blur-2xs cursor-pointer"
                                  >
                                    <ExternalLink className="w-4 h-4 text-[#F7C948]" />
                                    Xem tài liệu gốc
                                  </a>
                                </div>

                                {doc.status === 'PENDING' && (
                                  <div className="p-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleRejectDocumentClick(provider.id, doc.id, docTitle)}
                                      className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                    >
                                      Từ chối
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveDocumentClick(provider.id, doc.id, docTitle)}
                                      className="px-3 py-1 text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                    >
                                      Duyệt hợp lệ
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      {!isLoading && totalPages > 1 && (
        <div className="bg-white border border-slate-200/70 rounded-3xl shadow-sm px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Trang trước
          </button>
          <span className="text-xs font-semibold text-slate-500">
            Trang <strong className="text-[#08243D]">{page}</strong> / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Trang sau →
          </button>
        </div>
      )}

      {/* ── Confirm Action Modal ───────────────────────────────────────── */}
      {actionModal.show && actionModal.actionType && (
        <ActionConfirmModal
          show={actionModal.show}
          title={actionModal.title}
          message={actionModal.message}
          actionType={actionModal.actionType as ActionType}
          providerId={actionModal.providerId!}
          onCancel={() => setActionModal((prev) => ({ ...prev, show: false }))}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
