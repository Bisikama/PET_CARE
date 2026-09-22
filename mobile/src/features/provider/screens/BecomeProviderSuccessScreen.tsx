import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, Copy, CheckCircle2, Hourglass, Phone, MessageCircle, Home, FileEdit } from 'lucide-react-native';
import { Screen } from '../../../core/components/Screen';
import { ScreenHeader } from '../../../core/components/ScreenHeader';
import { Button } from '../../../core/components/Button';
import { theme } from '../../../core/theme';

export default function BecomeProviderSuccessScreen() {
  const router = useRouter();

  const handleGoHome = () => {
    router.replace('/(customer)/(tabs)/profile');
  };

  return (
    <Screen style={styles.container}>
      <ScreenHeader transparent rightIcon="bell" onRightPress={() => {}} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Icon */}
        <View style={styles.headerIconContainer}>
          <View style={styles.shieldBg}>
            <ShieldCheck size={40} color="#FBBF24" />
          </View>
          <View style={styles.statusBadge}>
            <Hourglass size={14} color="#B45309" />
            <Text style={styles.statusBadgeText}>Đang xét duyệt hồ sơ</Text>
          </View>
        </View>

        <Text style={styles.title}>Hồ sơ của bạn đã được tiếp nhận!</Text>
        <Text style={styles.desc}>
          PetCare đang tiến hành thẩm định thông tin và chứng từ. Đội ngũ hỗ trợ sẽ liên hệ qua SĐT đăng ký trong vòng <Text style={{fontWeight: '700', color: '#0F172A'}}>24-48h</Text> làm việc.
        </Text>

        {/* Thông tin đã nộp */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <FileEdit size={16} color="#475569" />
              <Text style={styles.cardTitle}>Thông tin đã nộp</Text>
            </View>
            <View style={styles.tagYellow}>
              <Text style={styles.tagYellowText}>● Chờ thẩm định</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã hồ sơ</Text>
            <View style={styles.infoValRow}>
              <View style={styles.idBadge}><Text style={styles.idText}>#PWC-89214</Text></View>
              <Copy size={14} color="#64748B" />
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên cơ sở / Cá nhân</Text>
            <Text style={styles.infoVal}>Hồ sơ đối tác mới</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian gửi</Text>
            <Text style={styles.infoVal}>{new Date().toLocaleDateString('vi-VN')} - {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</Text>
          </View>
        </View>

        {/* Lộ trình phê duyệt */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <View style={styles.iconCircleSmall}><Text style={{fontSize: 10}}>●</Text></View>
              <Text style={styles.cardTitle}>Lộ trình phê duyệt</Text>
            </View>
          </View>

          <View style={styles.timeline}>
            {/* Timeline Line */}
            <View style={styles.timelineLine} />

            {/* Step 1 */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, {backgroundColor: '#10B981'}]}>
                <CheckCircle2 size={16} color="white" />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>Nộp hồ sơ thành công</Text>
                  <View style={styles.tagGreen}><Text style={styles.tagGreenText}>Hoàn tất</Text></View>
                </View>
                <Text style={styles.timelineDesc}>Đầy đủ thông tin cơ sở và hình ảnh giấy phép.</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, {backgroundColor: '#F59E0B'}]}>
                <Hourglass size={16} color="white" />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>Thẩm định hồ sơ & cơ sở</Text>
                  <View style={styles.tagYellow}><Text style={styles.tagYellowText}>Đang xử lý</Text></View>
                </View>
                <Text style={styles.timelineDesc}>PetCare xác thực giấy tờ & kiểm duyệt tiêu chuẩn dịch vụ.</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineIcon, {backgroundColor: '#E2E8F0'}]}>
                <View style={{width: 8, height: 8, borderRadius: 4, backgroundColor: '#94A3B8'}} />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Text style={[styles.timelineTitle, {color: '#64748B'}]}>Ký hợp đồng & Đón khách</Text>
                  <Text style={{fontSize: 11, color: '#94A3B8'}}>Bước kế tiếp</Text>
                </View>
                <Text style={styles.timelineDesc}>Ký số trực tuyến, mở lịch và bắt đầu nhận khách trên PetCare.</Text>
              </View>
            </View>

          </View>
        </View>

        {/* Support Options */}
        <Text style={styles.supportLabel}>Cần trợ giúp với hồ sơ?</Text>
        <View style={styles.supportRow}>
          <TouchableOpacity style={styles.supportCard} activeOpacity={0.8}>
            <View style={[styles.supportIconBox, {backgroundColor: '#FEF3C7'}]}>
              <Phone size={18} color="#D97706" />
            </View>
            <Text style={styles.supportSub}>GỌI HOTLINE ĐỐI TÁC</Text>
            <Text style={styles.supportVal}>1900 6868</Text>
            <Text style={styles.supportStatus}>● Bấm để gọi ngay</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportCard} activeOpacity={0.8}>
            <View style={[styles.supportIconBox, {backgroundColor: '#1E293B'}]}>
              <MessageCircle size={18} color="white" />
            </View>
            <Text style={styles.supportSub}>CHAT HỖ TRỢ</Text>
            <Text style={styles.supportVal}>Zalo / Chat</Text>
            <Text style={styles.supportStatus}>Phản hồi tức thì &lt; 5p</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Buttons */}
      <View style={styles.bottomBar}>
        <Button 
          label="Quay lại trang chủ" 
          onPress={handleGoHome} 
          leftIcon="home"
          style={styles.homeBtn}
          labelStyle={styles.homeBtnText}
        />
        <Button 
          label="Chỉnh sửa hoặc bổ sung tài liệu" 
          onPress={() => router.back()} 
          leftIcon="file-text"
          style={styles.editBtn}
          labelStyle={styles.editBtnText}
          variant="outline"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: 150,
  },
  headerIconContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  shieldBg: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -16,
    zIndex: 1,
    borderWidth: 4,
    borderColor: 'white',
    ...theme.shadows.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    zIndex: 2,
    borderWidth: 2,
    borderColor: 'white',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  title: {
    ...theme.typography.h1,
    fontSize: 24,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    ...theme.typography.bodyMd,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  tagYellow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagYellowText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  idText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  iconCircleSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    paddingLeft: 4,
    position: 'relative',
    marginTop: 8,
  },
  timelineLine: {
    position: 'absolute',
    left: 17,
    top: 20,
    bottom: 30,
    width: 2,
    backgroundColor: '#E2E8F0',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
    position: 'relative',
    zIndex: 1,
  },
  timelineIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: 'white',
  },
  timelineContent: {
    flex: 1,
    marginTop: 2,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  tagGreen: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagGreenText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
  },
  timelineDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  supportLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    marginTop: 8,
  },
  supportRow: {
    flexDirection: 'row',
    gap: 12,
  },
  supportCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border.subdued,
  },
  supportIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  supportSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  supportVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  supportStatus: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '500',
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
    gap: 12,
  },
  homeBtn: {
    backgroundColor: '#FBBF24',
    borderRadius: 16,
    height: 52,
  },
  homeBtnText: {
    color: '#0F172A',
    fontWeight: '700',
  },
  editBtn: {
    height: 52,
    borderRadius: 16,
    borderColor: '#E2E8F0',
  },
  editBtnText: {
    color: '#475569',
    fontWeight: '600',
  }
});
