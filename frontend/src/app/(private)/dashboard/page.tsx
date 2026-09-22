'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { Heart, Mail, Plus, Shield, User, AlertCircle, Check, HelpCircle, Briefcase, LayoutDashboard, ClipboardList, Database, ShieldCheck, Gavel, BarChart3, Activity, MessageSquare } from 'lucide-react';
import { PetList, usePetStore } from '@/features/pet';
import { useMeStore, CustomerBookingAction } from '@/features/me';
import { ProviderHeader, useProvider, AddAreaModal, AddCapabilityModal, AddCertificateModal, BookingActionDetail, useProviderBookingStore } from '@/features/provider';
import { providerService } from '@/features/provider/services/provider.service';
import { AdminHeader, PartnerVerificationList, AdminDashboardStats, AdminUserManagement, AdminAuditLogsList, AdminServicesManager } from '@/features/admin';
import { AdminDisputeList } from '@/features/admin-care/components';
import { PromotionsView, AdminPromotionsManager } from '@/features/promotions';
import { ServiceDetailModal } from '@/features/services';
import { ScheduleManager } from '@/features/schedule';
import { EscrowManagement } from '@/features/settlement';
import { AreaManager } from '@/features/areas';
import { WalletOverview, TransactionHistory, BankAccountsManager } from '@/features/wallets';
import { ChatWindowModal } from '@/features/chat';
import { Globe, Trash2, PlusCircle, FileText, Eye } from 'lucide-react';

function DashboardContent() {
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openModal: openProfileModal } = useMeStore();
  const { openModal: openPetModal } = usePetStore();
  const { openModal: openProviderModal } = useProvider();
  const [providerTab, setProviderTab] = React.useState('active-cases');
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
        ) : adminTab === 'escrow' ? (
          <EscrowManagement key={adminRefreshKey} />
        ) : adminTab === 'chat' ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Trò Chuyện & Nhắn Tin Hệ Thống</h2>
            <ChatWindowModal isOpen={true} onClose={() => router.push('/dashboard?tab=dashboard')} />
          </div>
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

          {providerTab === 'chat' && (
            <div className="space-y-6">
              <ChatWindowModal 
                isOpen={true} 
                onClose={() => {
                  router.push('/dashboard?tab=active-cases');
                  router.refresh();
                }} 
              />
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
                              <span className="text-xs text-amber-600 font-extrabold bg-amber-50/50 px-2 py-0.5 rounded-lg border border-amber-100">
                                {new Intl.NumberFormat('vi-VN').format(item.price)} đ
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

  if (searchParams.get('tab') === 'chat') {
    return (
      <div className="space-y-6 animate-fade-in">
        <ChatWindowModal 
          isOpen={true} 
          onClose={() => {
            router.push('/dashboard');
            router.refresh();
          }} 
        />
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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative bg-[#031625] p-8 md:p-10 rounded-[32px] text-white shadow-xl overflow-hidden border border-slate-800/60">
        {/* Glow effects */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(circle_at_top_right,rgba(240,192,90,0.12),transparent_60%)] pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-[radial-gradient(circle_at_bottom,rgba(20,184,166,0.04),transparent_60%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3.5">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-400/5 border border-amber-400/15 text-[#f0c05a] text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-current" />
              Khu vực chủ nuôi
            </div>
            
            {/* Title */}
            <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-white leading-tight">
              Chào mừng trở lại,{' '}
              <span 
                onClick={openProfileModal} 
                className="cursor-pointer underline decoration-teal-400/60 decoration-wavy underline-offset-6 hover:text-teal-300 transition-all duration-200"
              >
                {user?.fullName || 'Người dùng'}
              </span>
              !
            </h2>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button 
              onClick={openProviderModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/25 text-teal-300 text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Briefcase className="w-4 h-4" />
              Đăng ký làm đối tác
            </button>
            <button 
              onClick={openPetModal}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-700/80 bg-slate-800/20 hover:bg-slate-800/40 text-white text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Đăng ký bé cưng
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#f0c05a] hover:bg-[#e0b04a] text-slate-950 text-sm font-bold transition-all duration-200 active:scale-95 shadow-md shadow-amber-500/10">
              <Heart className="w-4 h-4 fill-current" />
              Đặt người chăm sóc mới
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Actions and My Pets List */}
        <div className="lg:col-span-2 space-y-8">
          <CustomerBookingAction />
          <PetList />
        </div>

        {/* Right column: Account Info Details */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Thông tin tài khoản</h3>
              <p className="text-slate-400 text-xs mt-0.5">Chi tiết tài khoản đăng nhập của bạn.</p>
            </div>

            <div className="space-y-4">
              <div 
                onClick={openProfileModal}
                className="flex items-center gap-4 p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer transition-all duration-200 active:scale-[0.99]"
              >
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Họ và tên</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{user?.fullName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-medium">Email</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Vai trò hệ thống</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{user?.role || 'N/A'}</p>
                </div>
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
