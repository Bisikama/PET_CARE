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
  ShieldX,
  Filter,
  FileText,
} from 'lucide-react';
import { formatDate } from '@/utils/formatDate';

// ─── tiny badge helper ──────────────────────────────────────────────────────
function Badge({ variant, children }: { variant: 'success' | 'warning' | 'danger' | 'neutral'; children: React.ReactNode }) {
  const cls = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50  text-amber-700  border-amber-200',
    danger:  'bg-rose-50   text-rose-700   border-rose-200',
    neutral: 'bg-slate-100 text-slate-600  border-slate-200',
  }[variant];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${cls}`}>
      {children}
    </span>
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
      setProviderDocs(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleApproveKycClick = (providerId: string) => {
    setActionModal({
      show: true,
      title: 'Phê duyệt KYC',
      message: 'Bạn có chắc chắn muốn duyệt KYC cho đối tác này? Các thông tin eKYC sẽ được ghi nhận là hợp lệ.',
      actionType: 'approve-kyc',
      providerId,
    });
  };

  const handleOpenRejectModal = (providerId: string, type: 'KYC' | 'PROVIDER') => {
    setActionModal({
      show: true,
      title: type === 'KYC' ? 'Từ chối duyệt KYC' : 'Đình chỉ đối tác',
      message:
        type === 'KYC'
          ? 'Bạn có chắc muốn từ chối KYC? Lý do sẽ được gửi tới đối tác.'
          : 'Bạn có chắc muốn đình chỉ đối tác? Lý do sẽ được gửi tới đối tác.',
      actionType: type === 'KYC' ? 'reject-kyc' : 'reject-partner',
      providerId,
    });
  };

  const handleApproveDocumentClick = (providerId: string, documentId: string, docLabel: string) => {
    setActionModal({
      show: true,
      title: 'Phê duyệt tài liệu',
      message: `Bạn có chắc chắn muốn duyệt tài liệu "${docLabel}" hợp lệ?`,
      actionType: 'approve-document',
      providerId,
      documentId,
    });
  };

  const handleRejectDocumentClick = (providerId: string, documentId: string, docLabel: string) => {
    setActionModal({
      show: true,
      title: 'Từ chối tài liệu',
      message: `Bạn có chắc muốn từ chối tài liệu "${docLabel}"? Vui lòng nhập lý do từ chối.`,
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
        setProviderDocs(docs);
      }
    }
    else if (actionType === 'reject-document' && documentId) {
      const ok = await reviewDocument(providerId, documentId, 'REJECTED', reason);
      if (ok) {
        const docs = await fetchProviderDocuments(providerId);
        setProviderDocs(docs);
      }
    }
    setActionModal(prev => ({ ...prev, show: false }));
  };

  const handleApproveScreeningClick = (providerId: string) => {
    setActionModal({
      show: true,
      title: 'Duyệt Sàng lọc lý lịch',
      message: 'Xác nhận rằng bạn đã kiểm tra lý lịch đối tác này và kết quả hợp lệ (PASSED).',
      actionType: 'approve-screening' as ActionType,
      providerId,
    });
  };

  const handleApprovePartnerClick = (providerId: string) => {
    setActionModal({
      show: true,
      title: 'Kích hoạt đối tác',
      message: 'Bạn có chắc chắn muốn phê duyệt chính thức đối tác này tham gia hoạt động hệ thống?',
      actionType: 'approve-partner',
      providerId,
    });
  };

  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* ── Header & Filters ──────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Title bar */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
              Xét duyệt Đối tác
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Kiểm tra hồ sơ eKYC và cấp quyền hoạt động cho đối tác.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
              Tổng: <span className="text-teal-600">{total}</span> đối tác
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm tên hoặc email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm font-medium outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={kycStatus}
              onChange={e => { setKycStatus(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium outline-none focus:border-teal-400 transition-all cursor-pointer appearance-none"
            >
              <option value="">Tất cả KYC</option>
              <option value="PENDING">Chờ duyệt KYC</option>
              <option value="APPROVED">KYC đã duyệt</option>
              <option value="REJECTED">KYC từ chối</option>
            </select>
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-sm font-medium outline-none focus:border-teal-400 transition-all cursor-pointer appearance-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ kích hoạt</option>
              <option value="APPROVED">Đang hoạt động</option>
              <option value="REJECTED">Đình chỉ</option>
              <option value="DRAFT">Bản nháp</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Provider List ─────────────────────────────────────────────── */}
      {isLoading && providers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 flex flex-col items-center gap-3 text-center">
          <Loader2 className="w-9 h-9 text-teal-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Đang tải danh sách đối tác...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-12 flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-9 h-9 text-rose-400" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
          <p className="text-sm font-bold text-slate-400">Không tìm thấy đối tác nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map(provider => {
            const isExpanded = expandedProviderId === provider.id;

            const kycVariant =
              provider.kyc_status === 'APPROVED' ? 'success'
              : provider.kyc_status === 'PENDING' ? 'warning'
              : 'danger';

            const statusVariant =
              provider.status === 'APPROVED' ? 'success'
              : provider.status === 'REJECTED' ? 'danger'
              : 'neutral';

            return (
              <div
                key={provider.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md"
              >
                {/* ── Main row ── */}
                <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-5">
                  {/* Avatar + Info */}
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-white font-extrabold text-lg flex items-center justify-center uppercase shrink-0 shadow-sm">
                      {provider.users?.fullName?.charAt(0) || 'P'}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm truncate">
                          {provider.users?.fullName || 'Chưa cập nhật'}
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold uppercase shrink-0">
                          {provider.provider_type === 'SITTER' ? 'Pet Sitter'
                            : provider.provider_type === 'GROOMER' ? 'Groomer' : 'Thú y'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate">
                        {provider.users?.email || 'N/A'}
                        {provider.users?.phone && (
                          <span className="text-slate-400"> · {provider.users.phone}</span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Kinh nghiệm: <span className="font-bold text-slate-600">{provider.experience_years} năm</span>
                        {' · '}
                        CCCD: <span className="font-bold text-slate-600">{provider.id_number || '—'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status badges */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">KYC</span>
                      <Badge variant={kycVariant}>
                        {provider.kyc_status === 'APPROVED' ? '✓ Đã duyệt'
                          : provider.kyc_status === 'PENDING' ? '⏳ Chờ duyệt' : '✕ Từ chối'}
                      </Badge>
                    </div>

                    <div className="w-px h-8 bg-slate-100 mx-1 hidden sm:block" />

                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sàng lọc</span>
                      <Badge variant={provider.screening_status === 'PASSED' ? 'success' : provider.screening_status === 'FAILED' ? 'danger' : 'neutral'}>
                        {provider.screening_status === 'PASSED' ? '✓ Đã qua'
                          : provider.screening_status === 'FAILED' ? '✕ Bị loại' : '— Chưa'}
                      </Badge>
                    </div>

                    <div className="w-px h-8 bg-slate-100 mx-1 hidden sm:block" />

                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hồ sơ</span>
                      <Badge variant={statusVariant}>
                        {provider.status === 'APPROVED' ? '✓ Hoạt động'
                          : provider.status === 'REJECTED' ? '✕ Đình chỉ' : '⏳ Chờ'}
                      </Badge>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => handleExpandToggle(provider.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      eKYC
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {provider.kyc_status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleOpenRejectModal(provider.id, 'KYC')}
                          title="Từ chối KYC"
                          className="w-8 h-8 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleApproveKycClick(provider.id)}
                          title="Duyệt KYC"
                          className="w-8 h-8 flex items-center justify-center text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {provider.kyc_status === 'APPROVED' && provider.status !== 'APPROVED' && (
                      provider.screening_status === 'PASSED' ? (
                        <button
                          onClick={() => handleApprovePartnerClick(provider.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-200 transition-all cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Kích hoạt
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApproveScreeningClick(provider.id)}
                          title="Duyệt sàng lọc lý lịch (Screening) để mở khóa nút Kích hoạt"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Duyệt Screening
                        </button>
                      )
                    )}

                    {provider.status === 'APPROVED' && (
                      <button
                        onClick={() => handleOpenRejectModal(provider.id, 'PROVIDER')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Đình chỉ
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Expanded eKYC detail ── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-6 space-y-6 animate-fade-in">
                    {/* Bio */}
                    {provider.bio && (
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Giới thiệu bản thân</h5>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed bg-white border border-slate-100 rounded-2xl px-4 py-3">
                          {provider.bio}
                        </p>
                      </div>
                    )}

                    {/* CCCD Info + Tips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* CCCD details */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Thông tin CCCD</h5>
                        <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-50 overflow-hidden">
                          {[
                            { label: 'Họ tên trên CCCD', value: provider.full_name_on_id },
                            { label: 'Số CCCD', value: provider.id_number },
                            {
                              label: 'Ngày sinh',
                              value: provider.dob
                                ? formatDate(provider.dob, { day: 'numeric', month: 'long', year: 'numeric' })
                                : null,
                            },
                            {
                              label: 'Ngày cấp',
                              value: provider.issue_date
                                ? formatDate(provider.issue_date, { day: 'numeric', month: 'long', year: 'numeric' })
                                : null,
                            },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between px-4 py-2.5">
                              <span className="text-xs text-slate-400 font-medium">{label}</span>
                              <span className="text-xs font-bold text-slate-700 text-right ml-2 uppercase">
                                {value || '—'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tips */}
                      <div className="p-4 bg-amber-50 border border-amber-200/40 rounded-2xl flex gap-3 self-start">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h6 className="text-xs font-extrabold text-amber-800">Lưu ý kiểm duyệt eKYC</h6>
                          <ul className="list-disc pl-4 text-[11px] text-amber-700/80 space-y-1 leading-relaxed">
                            <li>Đối chiếu Họ tên, Số CCCD, Ngày sinh với mặt trước của ảnh CCCD.</li>
                            <li>Đảm bảo ảnh mặt trước &amp; mặt sau rõ ràng, không mờ nhòe.</li>
                            <li>Ảnh chân dung phải đúng cùng một người với ảnh trên CCCD.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Document images */}
                    <div className="space-y-3">
                      <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Ảnh tài liệu xác minh</h5>
                      {docsLoading ? (
                        <div className="flex items-center gap-2 justify-center py-8 text-slate-400 text-xs font-semibold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Đang tải ảnh xác thực...
                        </div>
                      ) : providerDocs.length === 0 ? (
                        <div className="text-xs font-bold text-slate-400 text-center py-6 bg-white border border-slate-100 rounded-2xl">
                          Chưa nộp ảnh hoặc có lỗi khi tải.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {providerDocs.map(doc => {
                            const documentLabels: Record<string, string> = {
                              IDENTITY_CARD: 'Ảnh CCCD/CMND',
                              FACE_PORTRAIT: 'Ảnh chân dung',
                              GROOMING_CERTIFICATE: 'Chứng chỉ Cắt tỉa lông',
                              PET_CARE_CERTIFICATE: 'Chứng chỉ Chăm sóc thú cưng',
                              FIRST_AID_CERTIFICATE: 'Chứng chỉ Sơ cứu thú cưng',
                              BACKGROUND_SCREENING: 'Lý lịch tư pháp',
                              OTHER: 'Tài liệu bổ sung khác',
                            };
                            const label = documentLabels[doc.document_type] || doc.note || 'Tài liệu xác minh';
                            const isPdf = doc.file_url?.toLowerCase().endsWith('.pdf');

                            return (
                              <div key={doc.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                                <div>
                                  <div className="px-3 pt-3 pb-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider truncate" title={label}>
                                    {label}
                                  </div>
                                  <div className="relative h-[150px] bg-slate-50 group overflow-hidden">
                                    {isPdf ? (
                                      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-1.5 p-4">
                                        <FileText className="w-10 h-10 text-rose-500" />
                                        <span className="text-[10px] font-extrabold text-slate-500">Tài liệu PDF</span>
                                      </div>
                                    ) : (
                                      <img
                                        src={doc.file_url}
                                        alt={label}
                                        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                                      />
                                    )}
                                    <a
                                      href={doc.file_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-950/40 opacity-0 group-hover:opacity-100 text-white text-xs font-bold transition-opacity duration-200 cursor-pointer"
                                    >
                                      <Eye className="w-4 h-4" />
                                      {isPdf ? 'Mở file PDF' : 'Xem ảnh gốc'}
                                    </a>
                                  </div>
                                </div>
                                <div className="px-3 py-2 flex flex-col border-t border-slate-50 bg-slate-50/20">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-450 font-medium">Trạng thái</span>
                                    <span className={`text-[10px] font-extrabold ${
                                      doc.status === 'APPROVED' ? 'text-emerald-500'
                                      : doc.status === 'REJECTED' ? 'text-rose-500'
                                      : 'text-amber-500'
                                    }`}>
                                      {doc.status === 'APPROVED' ? '✓ Hợp lệ'
                                        : doc.status === 'REJECTED' ? '✕ Từ chối'
                                        : '⏳ Chờ duyệt'}
                                    </span>
                                  </div>
                                  {doc.status === 'PENDING' && (
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 w-full justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handleRejectDocumentClick(provider.id, doc.id, label)}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                      >
                                        <X className="w-3 h-3" />
                                        Từ chối
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleApproveDocumentClick(provider.id, doc.id, label)}
                                        className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                                      >
                                        <Check className="w-3 h-3" />
                                        Duyệt
                                      </button>
                                    </div>
                                  )}
                                </div>
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

      {/* ── Pagination ────────────────────────────────────────────────── */}
      {!isLoading && totalPages > 1 && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Trang trước
          </button>
          <span className="text-xs font-bold text-slate-500">
            Trang <span className="text-slate-800">{page}</span> / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Trang sau →
          </button>
        </div>
      )}

      {/* ── Confirm Modal ─────────────────────────────────────────────── */}
      {actionModal.show && actionModal.actionType && (
        <ActionConfirmModal
          show={actionModal.show}
          title={actionModal.title}
          message={actionModal.message}
          actionType={actionModal.actionType as ActionType}
          providerId={actionModal.providerId!}
          onCancel={() => setActionModal(prev => ({ ...prev, show: false }))}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
}
