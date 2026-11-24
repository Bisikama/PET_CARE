'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { ROUTES } from '@/lib/constants';
import {
  Heart,
  Mail,
  Plus,
  Shield,
  User,
  Briefcase,
  ShieldCheck,
  Sparkles,
  CalendarCheck2,
  Tag,
  Crown,
  ArrowUpRight,
  MapPin,
  FileText,
  PlusCircle,
  HeartHandshake,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { PetList, usePetStore } from '@/features/pet';
import { useMeStore, CustomerBookingAction } from '@/features/me';
import { ProviderHeader, useProvider, AddAreaModal, AddCapabilityModal, AddCertificateModal, BookingActionDetail, useProviderBookingStore } from '@/features/provider';
import { providerService } from '@/features/provider/services/provider.service';
import { AdminHeader, PartnerVerificationList, AdminDashboardStats, AdminUserManagement, AdminAuditLogsList, AdminServicesManager } from '@/features/admin';
import { AdminDisputeList } from '@/features/admin-care/components';
import { PromotionsView, AdminPromotionsManager, AdminSubscriptionsManager, MembershipView } from '@/features/promotions';
import { ServiceDetailModal } from '@/features/services';
import { ScheduleManager } from '@/features/schedule';
import { EscrowManagement, BankTransactionsManager } from '@/features/settlement';
import { AreaManager } from '@/features/areas';
import { WalletOverview, TransactionHistory, BankAccountsManager } from '@/features/wallets';

function DashboardContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal: openProfileModal, openAddressModal } = useMeStore();
  const { openModal: openPetModal, pets } = usePetStore();
  const { openModal: openProviderModal } = useProvider();
  const adminTab = searchParams.get('tab') || 'verify-partners';
  
  const { activeBookingId } = useProviderBookingStore();

  const [profileData, setProfileData] = React.useState<any>(null);
  const [documentsList, setDocumentsList] = React.useState<any[]>([]);
  const [systemServices, setSystemServices] = React.useState<any[]>([]);
  const [providerSelectedServiceId, setProviderSelectedServiceId] = React.useState<string | null>(null);
  
  const [showAreaModal, setShowAreaModal] = React.useState(false);
  const [showCapabilityModal, setShowCapabilityModal] = React.useState(false);
  const [showCertificateModal, setShowCertificateModal] = React.useState(false);


  const loadProviderData = React.useCallback(async () => {
    if (user?.role !== 'PROVIDER') return;
    try {
      const [profile, docs, activeSrvs] = await Promise.all([
        providerService.getProfile(),
        providerService.getDocuments(),
        providerService.getActiveServices()
      ]);
      setProfileData(profile);
      setDocumentsList(docs || []);
      setSystemServices(activeSrvs || []);
    } catch (err) {
      console.error('Error loading provider dashboard data:', err);
    }
  }, [user?.role]);

  React.useEffect(() => {
    loadProviderData();
  }, [loadProviderData]);

  const [adminRefreshKey, setAdminRefreshKey] = React.useState(0);
  const [isAdminSyncing, setIsAdminSyncing] = React.useState(false);

  const handleAdminSync = React.useCallback(async () => {
    setIsAdminSyncing(true);
    setAdminRefreshKey((k) => k + 1);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsAdminSyncing(false);
  }, []);

  if (user?.role === 'ADMIN') {
    return (
      <div className="space-y-8 animate-fade-in animate-scale-up">
        {/* Admin Header Component */}
        <AdminHeader onSync={handleAdminSync} isSyncing={isAdminSyncing} />
        
        {/* Tab Content Panel */}
        {adminTab === 'dashboard' ? (
          <AdminDashboardStats key={adminRefreshKey} refreshKey={adminRefreshKey} />
        ) : adminTab === 'verify-partners' ? (
          <PartnerVerificationList key={adminRefreshKey} />
        ) : adminTab === 'services-manager' ? (
          <AdminServicesManager key={adminRefreshKey} />
        ) : adminTab === 'limits' ? (
          <AdminUserManagement key={adminRefreshKey} />
        ) : adminTab === 'logs' ? (
          <AdminAuditLogsList key={adminRefreshKey} />
        ) : adminTab === 'promotions' ? (
          <AdminPromotionsManager key={adminRefreshKey} />
        ) : adminTab === 'subscriptions' ? (
          <AdminSubscriptionsManager key={adminRefreshKey} />
        ) : adminTab === 'escrow' ? (
          <EscrowManagement key={adminRefreshKey} />
        ) : adminTab === 'bank-transactions' ? (
          <BankTransactionsManager key={adminRefreshKey} />
        ) : adminTab === 'arbitration' ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Trọng Tài Tranh Chấp & Khiếu Nại</h2>
            <AdminDisputeList key={adminRefreshKey} />
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-teal-50 text-teal-600 rounded-3xl">
              <Shield className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-800">Bảng điều khiển & Chức năng</h3>
              <p className="text-slate-400 text-xs md:text-sm max-w-sm">
                Tính năng này đang được thiết lập kết nối dữ liệu. Vui lòng quay lại sau.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (user?.role === 'PROVIDER') {
    const providerTab = searchParams.get('tab') || 'active-cases';

    if (providerTab === 'promotions') {
      return (
        <div className="animate-fade-in space-y-8">
          <ProviderHeader />
          <PromotionsView />
        </div>
      );
    }

    return (
      <>
        <div className="space-y-8 animate-fade-in">
          <ProviderHeader />
          
          {/* Tab Contents */}
          {providerTab === 'active-cases' && (
            <div className="space-y-6">
               <BookingActionDetail bookingId={activeBookingId} />
            </div>
          )}

          {providerTab === 'wallet' && (
            <div className="space-y-6">
               <WalletOverview />
               <TransactionHistory />
               <BankAccountsManager />
            </div>
          )}

          {providerTab === 'schedule' && (
            <div className="space-y-6">
              {/* Main content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Capabilities & Service Areas */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Capabilities */}
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Năng lực dịch vụ</h4>
                      <button
                        onClick={() => setShowCapabilityModal(true)}
                        className="text-xs text-indigo-650 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-xl transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Đăng ký
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {profileData?.provider_services && profileData.provider_services.length > 0 ? (
                        profileData.provider_services.map((item: any) => {
                          const name = systemServices.find(s => s.id === item.service_id)?.name || 'Dịch vụ đối tác';
                          return (
                            <div 
                              key={item.id} 
                              onClick={() => setProviderSelectedServiceId(item.service_id)}
                              className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
                              title="Click để xem chi tiết dịch vụ"
                            >
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold text-slate-800 group-hover:text-teal-600 transition-colors block">{name}</span>
                                <span className="text-[10px] text-slate-450 font-semibold block">
                                  {item.pet_species === 'Dog' ? '🐶 Chó' : '🐱 Mèo'} ({item.min_weight} - {item.max_weight} kg)
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${
                                  item.status === 'APPROVED'
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                                    : item.status === 'REJECTED'
                                      ? 'text-rose-700 bg-rose-50 border-rose-100'
                                      : 'text-amber-700 bg-amber-50 border-amber-100'
                                }`}
                                title="Giá do PetCare niêm yết theo cân nặng — bấm để xem bảng giá"
                              >
                                {item.status === 'APPROVED'
                                  ? 'Đã duyệt'
                                  : item.status === 'REJECTED'
                                    ? 'Bị từ chối'
                                    : item.status === 'NEED_RESUBMIT'
                                      ? 'Cần bổ sung'
                                      : 'Chờ duyệt'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                          Chưa đăng ký năng lực dịch vụ nào.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service Areas */}
                  <AreaManager />
                </div>

                {/* Right Column: Working Hours & Professional Certificates */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Working hours */}
                  <ScheduleManager />

                  {/* Certificates */}
                  <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Chứng chỉ chuyên môn bổ sung</h4>
                      <button
                        onClick={() => setShowCertificateModal(true)}
                        className="text-xs text-indigo-650 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-xl transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Tải chứng chỉ lên
                      </button>
                    </div>

                    <div className="space-y-3">
                      {documentsList && documentsList.filter(d => d.document_type !== 'IDENTITY_CARD' && d.document_type !== 'FACE_PORTRAIT').length > 0 ? (
                        documentsList.filter(d => d.document_type !== 'IDENTITY_CARD' && d.document_type !== 'FACE_PORTRAIT').map((doc: any) => {
                          const typeLabels: Record<string, string> = {
                            GROOMING_CERTIFICATE: 'Chứng chỉ Cắt tỉa lông (Grooming)',
                            PET_CARE_CERTIFICATE: 'Chứng chỉ Chăm sóc thú cưng',
                            FIRST_AID_CERTIFICATE: 'Chứng chỉ Sơ cứu thú cưng',
                            BACKGROUND_SCREENING: 'Lý lịch tư pháp',
                            OTHER: 'Tài liệu bổ sung khác',
                          };
                          const statusColors: Record<string, string> = {
                            PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
                            APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                            REJECTED: 'bg-rose-50 text-rose-600 border-rose-100',
                          };
                          const statusTexts: Record<string, string> = {
                            PENDING: 'Đang duyệt',
                            APPROVED: 'Đã duyệt',
                            REJECTED: 'Từ chối',
                          };

                          return (
                            <div key={doc.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-slate-800 hover:text-teal-650 transition-colors truncate max-w-[240px]"
                                  title="Click để xem tài liệu"
                                >
                                  {typeLabels[doc.document_type] || 'Tài liệu đối tác'}
                                </a>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${statusColors[doc.status] || 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                {statusTexts[doc.status] || doc.status}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                          Chưa tải lên chứng chỉ chuyên môn nào.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <AddAreaModal
          show={showAreaModal}
          onClose={() => setShowAreaModal(false)}
          onSuccess={loadProviderData}
        />
        <AddCapabilityModal
          show={showCapabilityModal}
          onClose={() => setShowCapabilityModal(false)}
          onSuccess={loadProviderData}
        />
        <AddCertificateModal
          show={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          onSuccess={loadProviderData}
        />
        <ServiceDetailModal
          serviceId={providerSelectedServiceId}
          isOpen={!!providerSelectedServiceId}
          onClose={() => setProviderSelectedServiceId(null)}
        />
      </>
    );
  }

  if (searchParams.get('tab') === 'promotions') {
    return (
      <div className="animate-fade-in">
        <PromotionsView />
      </div>
    );
  }

  if (searchParams.get('tab') === 'membership') {
    return (
      <div className="animate-fade-in">
        <MembershipView />
      </div>
    );
  }

  if (searchParams.get('tab') === 'wallet') {
    return (
      <div className="space-y-6 animate-fade-in">
         <WalletOverview />
         <TransactionHistory />
      </div>
    );
  }

  const displayName = user?.fullName || 'Người dùng';

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      {/* 1. Minimalist Luxury Welcome Banner */}
      <div className="relative bg-[#08243D] py-10 px-8 md:px-10 rounded-3xl text-white shadow-sm overflow-hidden border border-slate-800/80">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(247,201,72,0.12),transparent_65%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#F7C948]">
              Không gian chủ nuôi
            </p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Xin chào,{' '}
              <button
                type="button"
                onClick={openProfileModal}
                className="text-[#F7C948] hover:underline underline-offset-4 cursor-pointer"
              >
                {displayName}
              </button>
            </h2>
            <p className="text-slate-300 text-sm max-w-lg">
              Quản lý hồ sơ thú cưng và đặt lịch chăm sóc tại nhà an toàn qua hệ thống Escrow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={openProviderModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-teal-300" />
              Đăng ký đối tác
            </button>

            <button
              type="button"
              onClick={openPetModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F7C948]" />
              Thêm thú cưng
            </button>

            <button
              type="button"
              onClick={() => router.push(ROUTES.BOOKINGS)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F7C948] hover:bg-[#f0be30] text-[#08243D] text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Heart className="w-4 h-4 fill-current" />
              Đặt lịch chăm sóc
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Active Booking Action & Pet List */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerBookingAction />
          <PetList />
        </div>

        {/* Right column: Clean Account Information Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-7 rounded-3xl border border-slate-200/70 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#08243D]">Thông tin tài khoản</h3>
                <p className="text-slate-400 text-xs mt-0.5">Hồ sơ cá nhân & địa chỉ</p>
              </div>
              <button
                type="button"
                onClick={openProfileModal}
                className="text-xs font-semibold text-teal-600 hover:text-[#08243D] transition-colors cursor-pointer"
              >
                Chỉnh sửa
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={openProfileModal}
                className="flex items-center gap-3.5 p-3.5 bg-slate-50/70 hover:bg-slate-100/70 rounded-2xl border border-slate-100 cursor-pointer transition-colors"
              >
                <div className="p-2.5 bg-white text-[#08243D] rounded-xl border border-slate-200/60 shadow-2xs">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-400 font-medium">Họ và tên</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                <div className="p-2.5 bg-white text-[#08243D] rounded-xl border border-slate-200/60 shadow-2xs">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-slate-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.email || 'N/A'}</p>
                </div>
              </div>

              <div
                onClick={openAddressModal}
                className="flex items-center justify-between gap-3.5 p-3.5 bg-slate-50/70 hover:bg-slate-100/70 rounded-2xl border border-slate-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 bg-white text-[#08243D] rounded-xl border border-slate-200/60 shadow-2xs">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400 font-medium">Sổ địa chỉ</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">Địa chỉ nhận dịch vụ</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-teal-600">Quản lý</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
          <div className="w-10 h-10 rounded-full border-4 border-teal-600 border-t-transparent animate-spin mb-3" />
          <p className="text-sm font-semibold text-slate-500">Đang tải bảng điều khiển...</p>
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}

