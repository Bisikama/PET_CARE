import React from 'react';
import { View, StyleSheet, Text, Image, ScrollView, ActivityIndicator, Alert, Modal, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, TrendingUp, Calendar, Wallet, ShieldCheck, Star } from 'lucide-react-native';
import { Screen } from '../../../core/components/Screen';
import { Button } from '../../../core/components/Button';
import { Input } from '../../../core/components/Input';
import { ScreenHeader } from '../../../core/components/ScreenHeader';
import { theme } from '../../../core/theme';
import { useProviderStore } from '../store/useProviderStore';
import { ProviderType } from '../types/provider.types';

export default function BecomeProviderIntroScreen() {
  const router = useRouter();
  const { createProfile, isSubmitting, profile } = useProviderStore();

  const [showTypeModal, setShowTypeModal] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<ProviderType | null>(null);
  const [bio, setBio] = React.useState('');
  const [experienceYears, setExperienceYears] = React.useState('');

  const handleStart = async () => {
    if (isSubmitting) return;
    if (profile) {
      router.push('/(customer)/become-provider/form');
      return;
    }
    
    setShowTypeModal(true);
  };

  const handleConfirmCreate = async () => {
    if (!selectedType) return;
    
    setShowTypeModal(false);
    await createProfile({
      providerType: selectedType,
      bio: bio.trim() || undefined,
      experienceYears: experienceYears ? parseInt(experienceYears) : undefined
    });
    router.push('/(customer)/become-provider/form');
  };

  return (
    <Screen style={styles.container}>
      <ScreenHeader title="PETCARE PARTNER" rightIcon="help-circle" onRightPress={() => {}} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.badgeContainer}>
            <Star size={14} color={theme.colors.semantic.warning} />
            <Text style={styles.badgeText}>Chương trình Đối tác PetCare</Text>
          </View>
          <Text style={styles.heroTitle}>Biến tình yêu thú cưng thành thu nhập bền vững</Text>
          <Text style={styles.heroDesc}>
            Gia nhập mạng lưới dịch vụ chăm sóc thú cưng uy tín hàng đầu. Kết nối tức thì với cộng đồng khách hàng cao cấp gần bạn.
          </Text>
          
          <View style={styles.heroImageWrapper}>
            <Image 
              source={require('../../../../assets/images/banner.png')} 
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.floatingStats}>
            <View style={styles.pawIconBox}>
              <Text style={{fontSize: 16}}>🐾</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.statBold}>50.000+ ba mẹ thú cưng</Text>
              <Text style={styles.statSmall}>Đặt lịch mỗi tuần tại PetCare</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={12} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>4.9/5</Text>
            </View>
          </View>
        </View>

        {/* 3 Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>50k+</Text>
            <Text style={styles.statLabel}>Khách hàng</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>35Tr</Text>
            <Text style={styles.statLabel}>Thu nhập/tháng</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, {color: theme.colors.semantic.success}]}>0đ</Text>
            <Text style={styles.statLabel}>Phí nền tảng</Text>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionSub}>ĐẶC QUYỀN ĐỐI TÁC</Text>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Tại sao nên đồng hành?</Text>
            <View style={styles.guaranteeBadge}>
              <Text style={styles.guaranteeText}>● Đảm bảo 100%</Text>
            </View>
          </View>
        </View>

        <View style={styles.benefitsList}>
          <View style={styles.benefitCard}>
            <View style={[styles.iconBox, {backgroundColor: '#FFFBEB'}]}>
              <TrendingUp size={20} color="#D97706" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Doanh thu vượt trội</Text>
              <Text style={styles.benefitDesc}>Tiếp cận hàng ngàn chủ thú cưng ngay khu vực của bạn. Tăng doanh số đều đặn mà không tốn chi phí quảng cáo marketing.</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.iconBox, {backgroundColor: '#EFF6FF'}]}>
              <Calendar size={20} color="#2563EB" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Tự chủ thời gian</Text>
              <Text style={styles.benefitDesc}>Linh hoạt xếp lịch nhận đặt hẹn, bật/tắt nhận khách 1 chạm. Hoàn toàn chủ động quản lý thời gian và năng lực phục vụ.</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.iconBox, {backgroundColor: '#ECFDF5'}]}>
              <Wallet size={20} color="#059669" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Thanh toán liền tay</Text>
              <Text style={styles.benefitDesc}>Tiền về tài khoản ngay sau khi hoàn thành đơn. Đối soát tự động, hoa hồng rõ ràng và minh bạch từng chi tiết.</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.iconBox, {backgroundColor: '#F5F3FF'}]}>
              <ShieldCheck size={20} color="#7C3AED" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Bảo trợ toàn diện</Text>
              <Text style={styles.benefitDesc}>Gói bảo hiểm sự cố thú cưng tới 50 triệu đồng cùng đội ngũ chuyên viên PetCare hỗ trợ khẩn cấp 24/7.</Text>
            </View>
          </View>
        </View>

        {/* Process Section */}
        <View style={[styles.sectionHeader, {marginTop: theme.spacing[8]}]}>
          <Text style={styles.sectionSub}>QUY TRÌNH ĐƠN GIẢN</Text>
          <Text style={styles.sectionTitle}>3 bước bắt đầu nhận đơn</Text>
        </View>

        <View style={styles.processList}>
          {/* Timeline Line */}
          <View style={styles.timelineLine} />
          
          <View style={styles.processItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.processContent}>
              <View style={styles.processHeader}>
                <Text style={styles.processTitle}>Điền thông tin cơ bản</Text>
                <View style={styles.timeTag}><Text style={styles.timeText}>~ 2 phút</Text></View>
              </View>
              <Text style={styles.processDesc}>Cung cấp thông tin salon hoặc chuyên môn cá nhân, khu vực và các dịch vụ bạn muốn cung cấp.</Text>
            </View>
          </View>

          <View style={styles.processItem}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={styles.processContent}>
              <View style={styles.processHeader}>
                <Text style={styles.processTitle}>Xét duyệt hồ sơ online</Text>
                <View style={[styles.timeTag, {backgroundColor: '#ECFDF5'}]}><Text style={[styles.timeText, {color: '#059669'}]}>~ 24h</Text></View>
              </View>
              <Text style={styles.processDesc}>Đội ngũ kiểm tra nhanh chứng chỉ tay nghề hoặc hình ảnh cơ sở vật chất đảm bảo quy chuẩn an toàn.</Text>
            </View>
          </View>

          <View style={styles.processItem}>
            <View style={[styles.stepCircle, {backgroundColor: '#F59E0B'}]}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <View style={styles.processContent}>
              <View style={styles.processHeader}>
                <Text style={styles.processTitle}>Nhận khách & sinh lời</Text>
                <View style={[styles.timeTag, {backgroundColor: '#FEF3C7'}]}><Text style={[styles.timeText, {color: '#B45309'}]}>Sẵn sàng</Text></View>
              </View>
              <Text style={styles.processDesc}>Bật trạng thái nhận khách, đón nhận các lịch hẹn đầu tiên và nhận thu nhập ngay vào tài khoản.</Text>
            </View>
          </View>
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialCard}>
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map(i => <Star key={i} size={16} color="#F59E0B" />)}
            <Text style={styles.ratingScore}>5.0</Text>
          </View>
          <Text style={styles.quoteText}>
            "Từ khi tham gia PetCare, doanh thu spa thú cưng của tôi tăng gấp đôi, khách hàng thân thiết tăng đều đặn mỗi tháng mà không cần lo chi phí tìm khách."
          </Text>
          <View style={styles.authorRow}>
            <Image source={require('../../../../assets/images/logo.png')} style={styles.authorAvatar} />
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                <Text style={styles.authorName}>Minh Trang</Text>
                <CheckCircle2 size={14} color={theme.colors.semantic.success} />
              </View>
              <Text style={styles.authorTitle}>Chủ MinPaws Spa • Quận 7, TP.HCM</Text>
            </View>
          </View>
          <Text style={styles.quoteIconBig}>”</Text>
        </View>

        <View style={styles.securityRow}>
          <ShieldCheck size={16} color={theme.colors.semantic.success} />
          <Text style={styles.securityText}>Cam kết bảo mật thông tin & Hỗ trợ trực tiếp 24/7</Text>
        </View>

      </ScrollView>

      <Modal visible={showTypeModal} transparent animationType="slide">
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16}}>
              <Text style={styles.modalTitle}>Khởi tạo Hồ sơ Đối tác</Text>
              <TouchableOpacity onPress={() => setShowTypeModal(false)} style={{padding: 8}}>
                <Text style={styles.modalCancelText}>Đóng</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>1. Lĩnh vực chuyên môn</Text>
              <View style={styles.typesRow}>
                <TouchableOpacity 
                  style={[styles.typeOptionCard, selectedType === ProviderType.SITTER && styles.typeOptionActive]} 
                  onPress={() => setSelectedType(ProviderType.SITTER)}
                >
                  <Text style={[styles.typeOptionTitle, selectedType === ProviderType.SITTER && styles.typeOptionTitleActive]}>Sitter</Text>
                  <Text style={[styles.typeOptionDesc, selectedType === ProviderType.SITTER && styles.typeOptionDescActive]}>Chăm sóc thú cưng</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeOptionCard, selectedType === ProviderType.GROOMER && styles.typeOptionActive]} 
                  onPress={() => setSelectedType(ProviderType.GROOMER)}
                >
                  <Text style={[styles.typeOptionTitle, selectedType === ProviderType.GROOMER && styles.typeOptionTitleActive]}>Groomer</Text>
                  <Text style={[styles.typeOptionDesc, selectedType === ProviderType.GROOMER && styles.typeOptionDescActive]}>Spa & Cắt tỉa</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeOptionCard, selectedType === ProviderType.VET && styles.typeOptionActive]} 
                  onPress={() => setSelectedType(ProviderType.VET)}
                >
                  <Text style={[styles.typeOptionTitle, selectedType === ProviderType.VET && styles.typeOptionTitleActive]}>Vet</Text>
                  <Text style={[styles.typeOptionDesc, selectedType === ProviderType.VET && styles.typeOptionDescActive]}>Bác sĩ thú y</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, {marginTop: 16}]}>2. Giới thiệu bản thân (Bio)</Text>
              <Input
                placeholder="Ví dụ: Tôi rất yêu thích thú cưng..."
                multiline
                numberOfLines={3}
                value={bio}
                onChangeText={setBio}
                style={{minHeight: 80, textAlignVertical: 'top'}}
              />

              <Text style={[styles.inputLabel, {marginTop: 16}]}>3. Số năm kinh nghiệm</Text>
              <Input
                placeholder="Ví dụ: 3"
                keyboardType="numeric"
                value={experienceYears}
                onChangeText={setExperienceYears}
              />

              <Button
                label="Khởi tạo Hồ sơ & Đi tiếp"
                onPress={handleConfirmCreate}
                style={{marginTop: 24, height: 50, borderRadius: 12, backgroundColor: '#0F172A'}}
                disabled={!selectedType}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Sticky Bottom */}
      <View style={styles.bottomBar}>
        <Button 
          label={isSubmitting ? "Đang xử lý..." : "Đăng ký trở thành Đối tác ngay"}
          onPress={handleStart} 
          rightIcon={isSubmitting ? undefined : "arrow-right"}
          style={styles.ctaButton}
          // labelStyle={styles.ctaButtonText}
          disabled={isSubmitting}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOptionCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  typeOptionActive: {
    backgroundColor: '#E0E7FF',
    borderColor: '#6366F1',
  },
  typeOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeOptionTitleActive: {
    color: '#4F46E5',
  },
  typeOptionDesc: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  typeOptionDescActive: {
    color: '#4338CA',
  },
  modalCancelBtn: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  container: {
    backgroundColor: '#F8FAFC', // light background like image
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: 120, // space for sticky button
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  badgeText: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    ...theme.typography.h1,
    color: 'white',
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 12,
  },
  heroDesc: {
    ...theme.typography.bodyMd,
    color: '#94A3B8',
    marginBottom: 20,
    lineHeight: 22,
  },
  heroImageWrapper: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#334155',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingStats: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: -24,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pawIconBox: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 8,
  },
  statBold: {
    fontWeight: '700',
    fontSize: 13,
    color: '#0F172A',
  },
  statSmall: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 'auto',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    marginTop: theme.spacing[8],
    marginBottom: theme.spacing[5],
  },
  sectionSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...theme.typography.h2,
    fontSize: 22,
    color: '#0F172A',
  },
  guaranteeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  guaranteeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  benefitsList: {
    gap: 12,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  benefitDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  processList: {
    paddingLeft: 8,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 23,
    top: 20,
    bottom: 40,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  processItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
    zIndex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumber: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  processContent: {
    flex: 1,
  },
  processHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  processTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  timeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  processDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
  testimonialCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 4,
  },
  quoteText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 20,
    position: 'relative',
    zIndex: 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    zIndex: 2,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  authorTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  quoteIconBig: {
    position: 'absolute',
    bottom: -20,
    right: 10,
    fontSize: 120,
    color: '#F8FAFC',
    fontWeight: '900',
    zIndex: 1,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 40,
  },
  securityText: {
    fontSize: 12,
    color: '#64748B',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.subdued,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  ctaButton: {
    backgroundColor: '#FBBF24', // Yellow color
    borderRadius: 16,
    height: 56,
  },
  ctaButtonText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 13,
    color: '#64748B',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  }
});
