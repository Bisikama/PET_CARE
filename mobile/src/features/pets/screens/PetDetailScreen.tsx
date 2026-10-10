import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Dog,
  Cat,
  Edit3,
  Plus,
  Trash2,
  Calendar,
  Activity,
  Heart,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Stethoscope,
  X,
  Check,
  Share2,
  Scale,
  Clock,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { theme } from '@/core/theme';
import { petApi } from '../api/petApi';
import { Pet, MedicalRecord } from '../types/pet.types';
import { getPetAvatar } from '../utils/petAvatars';

type RecordFilter = 'ALL' | 'VACCINE' | 'ALLERGY' | 'SURGERY';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [pet, setPet] = useState<Pet | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<RecordFilter>('ALL');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [recordType, setRecordType] = useState<'VACCINE' | 'ALLERGY' | 'SURGERY'>('VACCINE');
  const [description, setDescription] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [petRes, recordsRes] = await Promise.all([
        petApi.getPet(id),
        petApi.getMedicalRecords(id),
      ]);
      if (petRes.success && petRes.data) {
        setPet(petRes.data);
      }
      if (recordsRes.success) {
        setRecords(recordsRes.data || []);
      }
    } catch (error) {
      console.log('Error fetching pet details', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSharePet = async () => {
    if (!pet) return;
    try {
      await Share.share({
        message: `Hồ sơ thú cưng: ${pet.name} (${pet.breed || pet.species || 'Thú cưng'}) trên PetCare!`,
      });
    } catch (error) {
      // Ignored
    }
  };

  const openModal = (record?: any) => {
    if (record) {
      setEditingRecord(record);
      setRecordType(record.recordType || record.record_type || 'VACCINE');
      setDescription(record.description || '');
      const d = record.date || record.recordDate;
      setRecordDate(d ? new Date(d).toISOString().split('T')[0] : '');
    } else {
      setEditingRecord(null);
      setRecordType('VACCINE');
      setDescription('');
      setRecordDate(new Date().toISOString().split('T')[0]); // Default today
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingRecord(null);
    setRecordType('VACCINE');
    setDescription('');
    setRecordDate('');
  };

  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    setRecordDate(d.toISOString().split('T')[0]);
  };

  const handleSaveRecord = async () => {
    if (!recordType || !description.trim() || !recordDate.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ loại mục, mô tả chi tiết và ngày thực hiện.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        recordType: recordType,
        description: description.trim(),
        date: new Date(recordDate).toISOString(),
      };

      if (editingRecord) {
        await petApi.updateMedicalRecord(id, editingRecord.id, payload);
        Alert.alert('Thành công 🎉', 'Đã cập nhật thông tin sổ y tế.');
      } else {
        const res = await petApi.createMedicalRecord(id, payload);
        if (res.success) {
          Alert.alert('Thành công 🎉', 'Đã thêm ghi chú y tế mới cho bé.');
        } else {
          Alert.alert('Lỗi', res.message || 'Không thể tạo sổ y tế.');
        }
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu sổ y tế.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    Alert.alert(
      'Xóa ghi chú y tế',
      'Bạn có chắc chắn muốn xóa bản ghi y tế này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await petApi.deleteMedicalRecord(id, recordId);
              setRecords((prev) => prev.filter((r) => r.id !== recordId));
            } catch (error: any) {
              Alert.alert('Lỗi', 'Không thể xóa sổ y tế.');
            }
          },
        },
      ]
    );
  };

  const handleBookForPet = () => {
    if (!pet) return;
    router.push({
      pathname: '/(customer)/bookings/select-pet',
      params: {
        preselectedPetId: pet.id,
      },
    });
  };

  const filteredRecords = useMemo(() => {
    if (activeFilter === 'ALL') return records;
    return records.filter((r: any) => (r.recordType || r.record_type) === activeFilter);
  }, [records, activeFilter]);

  if (loading) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary.navy} />
        <Text style={styles.loadingText}>Đang tải hồ sơ bé cưng...</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.screen, styles.centered]}>
        <AlertCircle size={48} color={theme.colors.semantic.error} />
        <Text style={styles.errorText}>Không tìm thấy thông tin bé cưng</Text>
        <TouchableOpacity style={styles.backBtnFull} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isDog = (pet.species || '').toLowerCase() === 'dog';
  const avatarUrl = getPetAvatar(pet);
  const health = pet.healthNote || pet.health_note;
  const behavior = pet.behaviorNote || pet.behavior_note;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#071A2F" />

      {/* Top Floating Nav Header */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navIconBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>

        <Text style={styles.navTitle} numberOfLines={1}>
          Hồ Sơ Bé Cưng
        </Text>

        <View style={styles.navRightRow}>
          <TouchableOpacity
            style={styles.navIconBtn}
            onPress={handleSharePet}
            activeOpacity={0.7}
          >
            <Share2 size={18} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navIconBtn, styles.navEditBtn]}
            onPress={() => router.push(`/(customer)/pets/${pet.id}/edit`)}
            activeOpacity={0.8}
          >
            <Edit3 size={18} color="#071A2F" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.secondary.gold]}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* Luxury Hero Showcase Section */}
        <View style={styles.heroSection}>
          {/* Subtle Ambient Rings */}
          <View style={styles.ambientGlow} />

          {/* Large Elevated Avatar */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            <View style={styles.speciesPill}>
              {isDog ? (
                <Dog size={14} color="#1D4ED8" />
              ) : (
                <Cat size={14} color="#B45309" />
              )}
              <Text style={styles.speciesPillText}>
                {isDog ? 'Cún cưng' : 'Mèo cưng'}
              </Text>
            </View>
          </View>

          {/* Pet Name & Identity */}
          <View style={styles.nameHeader}>
            <Text style={styles.petName}>{pet.name}</Text>
            <View style={styles.verifiedBadge}>
              <ShieldCheck size={14} color="#10B981" />
              <Text style={styles.verifiedText}>Đã xác minh</Text>
            </View>
          </View>

          <Text style={styles.petBreed}>
            {pet.breed || (isDog ? 'Chó cưng đáng yêu' : 'Mèo cưng đáng yêu')}
          </Text>

          {/* Quick Action Buttons inside Hero */}
          <View style={styles.heroActionsRow}>
            <TouchableOpacity
              style={styles.primaryHeroBtn}
              onPress={handleBookForPet}
              activeOpacity={0.85}
            >
              <Sparkles size={16} color="#071A2F" />
              <Text style={styles.primaryHeroBtnText}>Đặt Lịch Cho Bé</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryHeroBtn}
              onPress={() => openModal()}
              activeOpacity={0.85}
            >
              <Plus size={16} color="white" />
              <Text style={styles.secondaryHeroBtnText}>Thêm Sổ Y Tế</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.bodyContainer}>
          {/* 1. Key Metrics 2x2 Grid */}
          <View style={styles.metricsGrid}>
            {/* Age Card */}
            <View style={[styles.metricCard, { backgroundColor: '#EFF6FF' }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#DBEAFE' }]}>
                <Clock size={18} color="#1D4ED8" />
              </View>
              <Text style={styles.metricLabel}>ĐỘ TUỔI</Text>
              <Text style={styles.metricValue}>
                {pet.age !== undefined && pet.age !== null ? `${pet.age} tuổi` : 'Chưa rõ'}
              </Text>
              <Text style={styles.metricSub}>🎂 Sinh nhật</Text>
            </View>

            {/* Weight Card */}
            <View style={[styles.metricCard, { backgroundColor: '#ECFDF5' }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#D1FAE5' }]}>
                <Scale size={18} color="#059669" />
              </View>
              <Text style={styles.metricLabel}>CÂN NẶNG</Text>
              <Text style={styles.metricValue}>
                {pet.weight !== undefined && pet.weight !== null ? `${pet.weight} kg` : 'Chưa rõ'}
              </Text>
              <Text style={styles.metricSub}>⚖️ Thể trạng chuẩn</Text>
            </View>

            {/* Gender Card */}
            <View style={[styles.metricCard, { backgroundColor: '#FEF3C7' }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#FDE68A' }]}>
                <Heart size={18} color="#B45309" />
              </View>
              <Text style={styles.metricLabel}>GIỚI TÍNH</Text>
              <Text style={styles.metricValue}>
                {pet.gender === 'Male' ? '♂ Đực' : pet.gender === 'Female' ? '♀ Cái' : 'Chưa rõ'}
              </Text>
              <Text style={styles.metricSub}>
                {pet.gender === 'Male' ? 'Bé trai' : 'Bé gái'}
              </Text>
            </View>

            {/* Breed / Species Card */}
            <View style={[styles.metricCard, { backgroundColor: '#FAF5FF' }]}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#F3E8FF' }]}>
                {isDog ? (
                  <Dog size={18} color="#7E22CE" />
                ) : (
                  <Cat size={18} color="#7E22CE" />
                )}
              </View>
              <Text style={styles.metricLabel}>GIỐNG LOÀI</Text>
              <Text style={styles.metricValue} numberOfLines={1}>
                {pet.breed || (isDog ? 'Chó cảnh' : 'Mèo cảnh')}
              </Text>
              <Text style={styles.metricSub}>🧬 Thuần chủng</Text>
            </View>
          </View>

          {/* 2. Care & Behavior Highlights */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Activity size={20} color={theme.colors.primary.navy} />
              <Text style={styles.sectionTitle}>Sức Khỏe & Tính Cách</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/(customer)/pets/${pet.id}/edit`)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionActionText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.notesContainer}>
            {/* Health Card */}
            <View style={styles.noteCardEmerald}>
              <View style={styles.noteCardTop}>
                <View style={styles.noteBadgeEmerald}>
                  <ShieldCheck size={16} color="#059669" />
                  <Text style={styles.noteBadgeTextEmerald}>Tình trạng sức khỏe</Text>
                </View>
                <View style={styles.statusPillActive}>
                  <Text style={styles.statusPillActiveText}>Tốt</Text>
                </View>
              </View>
              <Text style={styles.noteBodyText}>
                {health || 'Bé có thể trạng khỏe mạnh, chưa ghi nhận dị ứng hay bệnh lý bẩm sinh.'}
              </Text>
            </View>

            {/* Behavior Card */}
            <View style={styles.noteCardAmber}>
              <View style={styles.noteCardTop}>
                <View style={styles.noteBadgeAmber}>
                  <Sparkles size={16} color="#B45309" />
                  <Text style={styles.noteBadgeTextAmber}>Tính cách & Thói quen</Text>
                </View>
                <View style={styles.statusPillFriendly}>
                  <Text style={styles.statusPillFriendlyText}>Thân thiện</Text>
                </View>
              </View>
              <Text style={styles.noteBodyText}>
                {behavior || 'Bé rất ngoan, quấn người và phối hợp tốt khi được tắm spa hoặc cắt tỉa.'}
              </Text>
            </View>
          </View>

          {/* 3. Medical Passport Section */}
          <View style={[styles.sectionHeader, { marginTop: 12 }]}>
            <View style={styles.sectionTitleRow}>
              <Stethoscope size={20} color={theme.colors.primary.navy} />
              <Text style={styles.sectionTitle}>Sổ Y Tế & Tiêm Chủng</Text>
              <View style={styles.recordCountBadge}>
                <Text style={styles.recordCountText}>{records.length}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addRecordHeaderBtn}
              onPress={() => openModal()}
              activeOpacity={0.8}
            >
              <Plus size={15} color="white" />
              <Text style={styles.addRecordHeaderBtnText}>Thêm mới</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
              onPress={() => setActiveFilter('ALL')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'ALL' && styles.filterChipTextActive]}>
                Tất cả ({records.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'VACCINE' && styles.filterChipActive]}
              onPress={() => setActiveFilter('VACCINE')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'VACCINE' && styles.filterChipTextActive]}>
                💉 Tiêm phòng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'ALLERGY' && styles.filterChipActive]}
              onPress={() => setActiveFilter('ALLERGY')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'ALLERGY' && styles.filterChipTextActive]}>
                ⚠️ Dị ứng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'SURGERY' && styles.filterChipActive]}
              onPress={() => setActiveFilter('SURGERY')}
            >
              <Text style={[styles.filterChipText, activeFilter === 'SURGERY' && styles.filterChipTextActive]}>
                🏥 Điều trị
              </Text>
            </TouchableOpacity>
          </View>

          {/* Timeline of Records */}
          {filteredRecords.length === 0 ? (
            <View style={styles.emptyRecordsCard}>
              <View style={styles.emptyIconCircle}>
                <Calendar size={32} color={theme.colors.primary.navy} />
              </View>
              <Text style={styles.emptyRecordsTitle}>Chưa có ghi chú y tế nào</Text>
              <Text style={styles.emptyRecordsDesc}>
                Lưu lại lịch tiêm dại, sổ giun và các đợt điều trị để chuyên viên chăm sóc an toàn nhất.
              </Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => openModal()}
                activeOpacity={0.85}
              >
                <Plus size={16} color="white" />
                <Text style={styles.emptyAddBtnText}>Thêm bản ghi đầu tiên</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              {filteredRecords.map((record: any, index) => {
                const type = record.recordType || record.record_type || 'VACCINE';
                const dateStr = record.date || record.recordDate;

                let badgeColor = '#059669';
                let badgeBg = '#ECFDF5';
                let typeLabel = 'Tiêm phòng (Vaccine)';
                let icon = '💉';

                if (type === 'ALLERGY') {
                  badgeColor = '#D97706';
                  badgeBg = '#FEF3C7';
                  typeLabel = 'Dị ứng / Cảnh báo';
                  icon = '⚠️';
                } else if (type === 'SURGERY') {
                  badgeColor = '#DC2626';
                  badgeBg = '#FEE2E2';
                  typeLabel = 'Phẫu thuật / Điều trị';
                  icon = '🏥';
                }

                return (
                  <View key={record.id || index} style={styles.timelineItem}>
                    {/* Line Connector */}
                    {index !== filteredRecords.length - 1 && (
                      <View style={styles.timelineLine} />
                    )}

                    {/* Timeline Node */}
                    <View style={[styles.timelineNode, { borderColor: badgeColor }]}>
                      <View style={[styles.timelineNodeDot, { backgroundColor: badgeColor }]} />
                    </View>

                    {/* Record Card */}
                    <View style={styles.recordCard}>
                      <View style={styles.recordHeaderRow}>
                        <View style={[styles.recordTypeTag, { backgroundColor: badgeBg }]}>
                          <Text style={[styles.recordTypeTagText, { color: badgeColor }]}>
                            {icon} {typeLabel}
                          </Text>
                        </View>

                        <View style={styles.recordActionsRow}>
                          <TouchableOpacity
                            onPress={() => openModal(record)}
                            style={styles.recordActionBtn}
                            activeOpacity={0.7}
                          >
                            <Edit3 size={15} color="#64748B" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteRecord(record.id)}
                            style={styles.recordActionBtn}
                            activeOpacity={0.7}
                          >
                            <Trash2 size={15} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text style={styles.recordContentText}>{record.description}</Text>

                      <View style={styles.recordFooterRow}>
                        <Calendar size={13} color="#94A3B8" />
                        <Text style={styles.recordDateText}>
                          {dateStr
                            ? new Date(dateStr).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })
                            : 'Chưa cập nhật ngày'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Quick Booking CTA Card */}
          <View style={styles.bookingCtaCard}>
            <View style={styles.bookingCtaIconWrap}>
              <Sparkles size={24} color="#F5B82E" />
            </View>
            <View style={styles.bookingCtaTextCol}>
              <Text style={styles.bookingCtaTitle}>Chăm sóc bé chu đáo</Text>
              <Text style={styles.bookingCtaSubtitle}>
                Đặt lịch spa, tắm tỉa hoặc trông giữ tại nhà cho bé {pet.name} ngay hôm nay.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bookingCtaButton}
              onPress={handleBookForPet}
              activeOpacity={0.85}
            >
              <Text style={styles.bookingCtaButtonText}>Đặt Ngay</Text>
              <ChevronRight size={16} color="#071A2F" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modern Medical Record Bottom Sheet Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBackdropClose}>
            <TouchableOpacity style={{ flex: 1 }} onPress={closeModal} />
          </View>

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {editingRecord ? 'Cập Nhật Sổ Y Tế' : 'Thêm Ghi Chú Y Tế Mới'}
                </Text>
                <Text style={styles.modalSubtitle}>Ghi lại lịch tiêm, bệnh án hoặc dị ứng cho bé</Text>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseBtn}>
                <X size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Type Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>PHÂN LOẠI GHI CHÚ *</Text>
                <View style={styles.typeSelectorRow}>
                  <TouchableOpacity
                    style={[styles.typeOptionBtn, recordType === 'VACCINE' && styles.typeOptionBtnActive]}
                    onPress={() => setRecordType('VACCINE')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.typeOptionIcon}>💉</Text>
                    <Text style={[styles.typeOptionText, recordType === 'VACCINE' && styles.typeOptionTextActive]}>
                      Tiêm phòng
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeOptionBtn, recordType === 'ALLERGY' && styles.typeOptionBtnActive]}
                    onPress={() => setRecordType('ALLERGY')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.typeOptionIcon}>⚠️</Text>
                    <Text style={[styles.typeOptionText, recordType === 'ALLERGY' && styles.typeOptionTextActive]}>
                      Dị ứng
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.typeOptionBtn, recordType === 'SURGERY' && styles.typeOptionBtnActive]}
                    onPress={() => setRecordType('SURGERY')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.typeOptionIcon}>🏥</Text>
                    <Text style={[styles.typeOptionText, recordType === 'SURGERY' && styles.typeOptionTextActive]}>
                      Điều trị
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>CHI TIẾT MÔ TẢ & GHI CHÚ *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Ví dụ: Tiêm mũi 7 bệnh Pfizer, uống thuốc trị ve rận, không ăn tôm cua..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Date Input with Quick Chips */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>NGÀY THỰC HIỆN (YYYY-MM-DD) *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD (Ví dụ: 2026-09-30)"
                  placeholderTextColor="#94A3B8"
                  value={recordDate}
                  onChangeText={setRecordDate}
                />

                <View style={styles.quickDateRow}>
                  <Text style={styles.quickDateLabel}>Chọn nhanh:</Text>
                  <TouchableOpacity
                    style={styles.quickDateChip}
                    onPress={() => handleSetQuickDate(0)}
                  >
                    <Text style={styles.quickDateChipText}>Hôm nay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickDateChip}
                    onPress={() => handleSetQuickDate(7)}
                  >
                    <Text style={styles.quickDateChipText}>7 ngày trước</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickDateChip}
                    onPress={() => handleSetQuickDate(30)}
                  >
                    <Text style={styles.quickDateChipText}>1 tháng trước</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.submitModalBtn, isSubmitting && styles.submitModalBtnDisabled]}
                onPress={handleSaveRecord}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#071A2F" />
                ) : (
                  <>
                    <Check size={18} color="#071A2F" />
                    <Text style={styles.submitModalBtnText}>
                      {editingRecord ? 'Lưu Thay Đổi' : 'Lưu Vào Sổ Y Tế'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#071A2F',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 20,
  },
  backBtnFull: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary.navy,
    borderRadius: theme.radius.full,
  },
  backBtnText: {
    color: 'white',
    fontWeight: '700',
  },

  /* Top Navigation Bar */
  topNav: {
    paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 20) + 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#071A2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navEditBtn: {
    backgroundColor: '#F5B82E',
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },

  /* Luxury Hero Showcase */
  heroSection: {
    backgroundColor: '#071A2F',
    paddingTop: 8,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    width: 280,
    height: 180,
    borderRadius: 140,
    backgroundColor: 'rgba(245, 184, 46, 0.08)',
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 6,
    marginBottom: 16,
  },
  avatarImage: {
    width: 114,
    height: 114,
    borderRadius: 57,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#1E293B',
  },
  speciesPill: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    ...theme.shadows.sm,
    elevation: 3,
  },
  speciesPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#071A2F',
  },
  nameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  petName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34D399',
  },
  petBreed: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 20,
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 10,
  },
  primaryHeroBtn: {
    flex: 1.2,
    height: 46,
    backgroundColor: '#F5B82E',
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...theme.shadows.sm,
  },
  primaryHeroBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#071A2F',
  },
  secondaryHeroBtn: {
    flex: 1,
    height: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryHeroBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },

  /* White Body Sheet */
  bodyContainer: {
    backgroundColor: '#F8F9FF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
  },

  /* 2x2 Metrics Grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '46%',
    borderRadius: 20,
    padding: 14,
    gap: 4,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  metricSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },

  /* Section Header */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  recordCountBadge: {
    backgroundColor: '#071A2F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recordCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
  },
  addRecordHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#071A2F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  addRecordHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },

  /* Care & Personality Notes */
  notesContainer: {
    gap: 12,
  },
  noteCardEmerald: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    ...theme.shadows.sm,
    gap: 10,
  },
  noteCardAmber: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    ...theme.shadows.sm,
    gap: 10,
  },
  noteCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteBadgeEmerald: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteBadgeTextEmerald: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  noteBadgeAmber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteBadgeTextAmber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  statusPillActive: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  statusPillActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  statusPillFriendly: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  statusPillFriendlyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  noteBodyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#334155',
    fontWeight: '500',
  },

  /* Filter Tabs */
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#071A2F',
    borderColor: '#071A2F',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextActive: {
    color: 'white',
  },

  /* Timeline */
  timelineContainer: {
    paddingLeft: 6,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 28,
    paddingBottom: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 20,
    bottom: -6,
    width: 2,
    backgroundColor: '#CBD5E1',
  },
  timelineNode: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineNodeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...theme.shadows.sm,
    gap: 8,
  },
  recordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTypeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  recordTypeTagText: {
    fontSize: 12,
    fontWeight: '800',
  },
  recordActionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  recordActionBtn: {
    padding: 4,
  },
  recordContentText: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 20,
    fontWeight: '500',
  },
  recordFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  recordDateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  /* Empty State */
  emptyRecordsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyRecordsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyRecordsDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#071A2F',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    marginTop: 6,
  },
  emptyAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },

  /* Quick Booking CTA Card */
  bookingCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#071A2F',
    borderRadius: 24,
    padding: 16,
    marginTop: 8,
    ...theme.shadows.md,
  },
  bookingCtaIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245, 184, 46, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCtaTextCol: {
    flex: 1,
    gap: 2,
  },
  bookingCtaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
  },
  bookingCtaSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  bookingCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F5B82E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  bookingCtaButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#071A2F',
  },

  /* Medical Modal Bottom Sheet */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 26, 47, 0.65)',
    justifyContent: 'flex-end',
  },
  modalBackdropClose: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    marginBottom: 16,
  },
  formGroup: {
    gap: 8,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  typeOptionBtnActive: {
    borderColor: '#071A2F',
    backgroundColor: '#071A2F',
  },
  typeOptionIcon: {
    fontSize: 13,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  typeOptionTextActive: {
    color: 'white',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  quickDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  quickDateLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  quickDateChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  quickDateChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  modalFooter: {
    paddingTop: 4,
  },
  submitModalBtn: {
    backgroundColor: '#F5B82E',
    height: 50,
    borderRadius: theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.shadows.sm,
  },
  submitModalBtnDisabled: {
    opacity: 0.65,
  },
  submitModalBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#071A2F',
  },
});
